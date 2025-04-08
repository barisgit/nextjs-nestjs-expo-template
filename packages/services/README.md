# Services Package

This package provides shared services that can be used across the backend and frontend applications, including authentication, Redis integration, and webhook handling.

## Features

- Clerk authentication integration
- Redis cache and pub/sub services
- Webhook handlers for external services
- NestJS modules for easy integration
- Type-safe service interfaces

## Installation

The package is included in the monorepo. It can be imported into any other package or app within the repo:

```json
{
  "dependencies": {
    "@repo/services": "workspace:*"
  }
}
```

## Modules

### Authentication (AuthModule)

Provides Clerk integration for authentication services.

#### Usage

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from '@repo/services';

@Module({
  imports: [AuthModule],
})
export class AppModule {}
```

#### Authentication Guards

The module provides guards for protecting routes:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser } from '@repo/services/auth';

@Controller('users')
export class UserController {
  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@CurrentUser() user: any) {
    return user;
  }
}
```

### Redis (RedisModule)

Provides Redis connectivity for caching and pub/sub functionality.

#### Usage

```typescript
import { Module } from '@nestjs/common';
import { RedisModule } from '@repo/services';

@Module({
  imports: [RedisModule],
})
export class AppModule {}
```

#### Redis Service

Inject the Redis service:

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from '@repo/services/redis';

@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  async get(key: string): Promise<string | null> {
    return this.redisService.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    await this.redisService.set(key, value, ttl);
  }

  async publish(channel: string, message: string): Promise<void> {
    await this.redisService.publish(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    await this.redisService.subscribe(channel, callback);
  }
}
```

### Webhooks (WebhooksModule)

Handles webhook processing from external services.

#### Usage

```typescript
import { Module } from '@nestjs/common';
import { WebhooksModule } from '@repo/services';

@Module({
  imports: [WebhooksModule],
})
export class AppModule {}
```

#### Webhook Controllers

Create webhook controllers using the provided utilities:

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { WebhookService, ValidateWebhook } from '@repo/services/webhooks';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('clerk')
  @ValidateWebhook('clerk')
  handleClerkWebhook(@Body() payload: any) {
    return this.webhookService.processClerkWebhook(payload);
  }
}
```

## Environment Configuration

Set the following environment variables to configure the services:

```env
# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional_password
REDIS_DB=0

# Webhook Configuration
WEBHOOK_SECRET_CLERK=your_clerk_webhook_secret
```

## Using Multiple Services

You can import multiple modules:

```typescript
import { Module } from '@nestjs/common';
import { AuthModule, RedisModule, WebhooksModule } from '@repo/services';

@Module({
  imports: [AuthModule, RedisModule, WebhooksModule],
})
export class AppModule {}
```

## Advanced Usage

### Custom Authentication Logic

Extend the authentication service with custom logic:

```typescript
import { Injectable } from '@nestjs/common';
import { AuthService } from '@repo/services/auth';

@Injectable()
export class CustomAuthService {
  constructor(private readonly authService: AuthService) {}

  async validateWithCustomRules(token: string) {
    const user = await this.authService.validateToken(token);
    
    // Add custom validation logic
    
    return user;
  }
}
```

### Redis Caching Strategies

Implement caching strategies:

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from '@repo/services/redis';

@Injectable()
export class CacheManager {
  constructor(private readonly redisService: RedisService) {}

  async getCachedData<T>(key: string, fetchFn: () => Promise<T>, ttl = 3600): Promise<T> {
    const cached = await this.redisService.get(key);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const data = await fetchFn();
    await this.redisService.set(key, JSON.stringify(data), ttl);
    
    return data;
  }
}
```

## Best Practices

1. Use dependency injection for all services
2. Implement proper error handling
3. Use environment variables for configuration
4. Cache frequently accessed data
5. Handle webhook validation securely