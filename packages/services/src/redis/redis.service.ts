import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis, RedisOptions } from "ioredis";

/**
 * Redis connection options with improved typings
 */
export interface RedisConnectionOptions {
  /**
   * Redis host
   * @default "localhost"
   */
  host?: string;

  /**
   * Redis port
   * @default 6379
   */
  port?: number;

  /**
   * Redis password
   * @default ""
   */
  password?: string;

  /**
   * Connection URL (overrides host/port/password if provided)
   */
  url?: string;

  /**
   * Database index
   * @default 0
   */
  db?: number;

  /**
   * Maximum number of retries per request
   * @default 3
   */
  maxRetriesPerRequest?: number;

  /**
   * Connection timeout in milliseconds
   * @default 5000
   */
  connectTimeout?: number;

  /**
   * Whether to enable TLS
   * @default false
   */
  tls?: boolean;
}

/**
 * Redis service for managing Redis connections and operations
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;
  private connectionError: Error | null = null;
  private readonly defaultTtl: number;

  constructor(private readonly configService: ConfigService) {
    // Default TTL in seconds
    this.defaultTtl = this.configService.get<number>("REDIS_DEFAULT_TTL", 300);
  }

  /**
   * Initialize Redis connection when the module is initialized
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.connect();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to initialize Redis client: ${errorMessage}`);
      this.connectionError =
        error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Cleanup Redis connection when the module is destroyed
   */
  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  /**
   * Get the Redis client options
   * @returns Redis client options
   */
  private getRedisOptions(): RedisOptions {
    // Check if REDIS_URL is provided
    const redisUrl = this.configService.get<string>("REDIS_URL");

    // Default options
    const defaultOptions: RedisOptions = {
      maxRetriesPerRequest: this.configService.get<number>(
        "REDIS_MAX_RETRIES",
        3
      ),
      connectTimeout: this.configService.get<number>(
        "REDIS_CONNECT_TIMEOUT",
        5000
      ),
      enableOfflineQueue: true,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };

    // If REDIS_URL is provided, use it
    if (redisUrl) {
      this.logger.log(
        `Connecting to Redis using URL: ${this.maskRedisUrl(redisUrl)}`
      );
      return {
        ...defaultOptions,
        // The URL includes all connection info
        ...(redisUrl ? { url: redisUrl } : {}),
      };
    }

    // Otherwise, use individual options
    const host = this.configService.get<string>("REDIS_HOST", "localhost");
    const port = this.configService.get<number>("REDIS_PORT", 6379);
    const password = this.configService.get<string>("REDIS_PASSWORD", "");
    const db = this.configService.get<number>("REDIS_DB", 0);
    const tls = this.configService.get<boolean>("REDIS_TLS", false);

    this.logger.log(`Connecting to Redis at ${host}:${port} (DB: ${db})`);

    return {
      ...defaultOptions,
      host,
      port,
      password: password || undefined,
      db,
      tls: tls ? {} : undefined,
    };
  }

  /**
   * Mask the Redis URL for logging (hiding passwords)
   * @param url Redis URL
   * @returns Masked URL
   */
  private maskRedisUrl(url: string): string {
    try {
      const redisUrl = new URL(url);
      if (redisUrl.password) {
        redisUrl.password = "***";
      }
      return redisUrl.toString();
    } catch (e) {
      void e;
      return "Invalid URL format";
    }
  }

  /**
   * Connect to Redis
   */
  private async connect(): Promise<void> {
    if (this.client && this.isConnected) {
      return;
    }

    try {
      const options = this.getRedisOptions();
      this.client = new Redis(options);

      // Setup event listeners
      this.client.on("error", (err: Error) => {
        this.logger.error(`Redis error: ${err.message}`);
        this.isConnected = false;
        this.connectionError = err;
      });

      this.client.on("connect", () => {
        this.logger.log("Successfully connected to Redis");
        this.isConnected = true;
        this.connectionError = null;
      });

      this.client.on("reconnecting", () => {
        this.logger.log("Reconnecting to Redis...");
      });

      // Test the connection
      await this.client.ping();
      this.isConnected = true;
      this.logger.log("Redis ping successful");
    } catch (error) {
      this.isConnected = false;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to connect to Redis: ${errorMessage}`);
      this.connectionError =
        error instanceof Error ? error : new Error(String(error));
      throw error;
    }
  }

  /**
   * Disconnect from Redis
   */
  private async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
        this.logger.log("Redis connection closed");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(`Error disconnecting from Redis: ${errorMessage}`);
      } finally {
        this.client = null;
        this.isConnected = false;
      }
    }
  }

  /**
   * Get the Redis client
   * @returns Redis client
   * @throws Error if Redis is not connected
   */
  getClient(): Redis {
    if (!this.client || !this.isConnected) {
      this.logger.warn("Redis client not connected, attempting to reconnect");
      this.connect().catch((err) => {
        this.logger.error(`Failed to reconnect to Redis: ${err.message}`);
      });
      throw new Error("Redis client not connected");
    }
    return this.client;
  }

  /**
   * Check if Redis is connected
   * @returns Whether Redis is connected
   */
  isRedisConnected(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Get the Redis connection error if any
   * @returns Redis connection error or null
   */
  getConnectionError(): Error | null {
    return this.connectionError;
  }

  /**
   * Set a value in Redis
   * @param key Key
   * @param value Value (will be JSON.stringified if object)
   * @param ttl TTL in seconds (optional)
   * @returns Whether the operation was successful
   */
  async set(
    key: string,
    value: string | number | boolean | Record<string, unknown>,
    ttl?: number
  ): Promise<boolean> {
    try {
      // Reconnect if not connected
      if (!this.isConnected) {
        await this.connect();
      }

      if (!this.client) {
        return false;
      }

      // Convert objects to JSON strings
      const valueToStore =
        typeof value === "object" ? JSON.stringify(value) : String(value);

      // Set with expiry if TTL is provided
      if (ttl !== undefined) {
        await this.client.set(key, valueToStore, "EX", ttl);
      } else if (this.defaultTtl > 0) {
        // Use default TTL if set
        await this.client.set(key, valueToStore, "EX", this.defaultTtl);
      } else {
        // No expiry
        await this.client.set(key, valueToStore);
      }

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Redis set error for key ${key}: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Get a value from Redis
   * @param key Key
   * @param parse Whether to parse the value as JSON
   * @returns Value or null if not found
   */
  async get<T = string>(key: string, parse = false): Promise<T | null> {
    try {
      // Reconnect if not connected
      if (!this.isConnected) {
        await this.connect();
      }

      if (!this.client) {
        return null;
      }

      const value = await this.client.get(key);

      if (value === null) {
        return null;
      }

      // Parse JSON if requested
      if (parse) {
        try {
          return JSON.parse(value) as T;
        } catch (e) {
          void e;
          this.logger.error(`Failed to parse Redis value for key ${key}`);
          return null;
        }
      }

      return value as unknown as T;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Redis get error for key ${key}: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Delete a key from Redis
   * @param key Key
   * @returns Whether the operation was successful
   */
  async del(key: string): Promise<boolean> {
    try {
      // Reconnect if not connected
      if (!this.isConnected) {
        await this.connect();
      }

      if (!this.client) {
        return false;
      }

      await this.client.del(key);
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Redis del error for key ${key}: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Check if a key exists in Redis
   * @param key Key
   * @returns Whether the key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      // Reconnect if not connected
      if (!this.isConnected) {
        await this.connect();
      }

      if (!this.client) {
        return false;
      }

      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Redis exists error for key ${key}: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Get the TTL of a key in Redis
   * @param key Key
   * @returns TTL in seconds or -1 if no expiry or -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    try {
      // Reconnect if not connected
      if (!this.isConnected) {
        await this.connect();
      }

      if (!this.client) {
        return -2;
      }

      return await this.client.ttl(key);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Redis ttl error for key ${key}: ${errorMessage}`);
      return -2;
    }
  }

  /**
   * Set the expiry of a key in Redis
   * @param key Key
   * @param ttl TTL in seconds
   * @returns Whether the operation was successful
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      // Reconnect if not connected
      if (!this.isConnected) {
        await this.connect();
      }

      if (!this.client) {
        return false;
      }

      await this.client.expire(key, ttl);
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Redis expire error for key ${key}: ${errorMessage}`);
      return false;
    }
  }
}
