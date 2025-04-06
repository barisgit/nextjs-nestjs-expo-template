import { env } from "@/env";

/**
 * Development logger utility
 * Only logs messages in development environment
 */
class Logger {
  private readonly isDev: boolean;

  constructor() {
    this.isDev = !env.NEXT_PUBLIC_IS_PRODUCTION;
  }

  log(...args: unknown[]): void {
    if (this.isDev) {
      // eslint-disable-next-line no-console -- logger
      console.log(...args);
    }
  }

  info(...args: unknown[]): void {
    if (this.isDev) {
      // eslint-disable-next-line no-console -- logger
      console.info(...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.isDev) {
      // eslint-disable-next-line no-console -- logger
      console.warn(...args);
    }
  }

  error(...args: unknown[]): void {
    if (this.isDev) {
      // eslint-disable-next-line no-console -- logger
      console.error(...args);
    }
  }

  debug(...args: unknown[]): void {
    if (this.isDev) {
      // eslint-disable-next-line no-console -- logger
      console.debug(...args);
    }
  }

  table(data: unknown): void {
    if (this.isDev) {
      // eslint-disable-next-line no-console -- logger
      console.table(data);
    }
  }
}

export const logger = new Logger();
