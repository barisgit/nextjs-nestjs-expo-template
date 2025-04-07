# Analytics Package

This package provides an implementation of PostHog analytics for server-side, web, and mobile applications.

## Features

- Server-side analytics using NestJS integration
- Non-blocking analytics tracking
- TypeScript support for event properties
- Support for various environments (development, production, etc.)

## Installation

The package is included in the monorepo. It can be imported into any other package or app within the repo:

```json
{
  "dependencies": {
    "@repo/analytics": "workspace:*"
  }
}
```

## Usage

### NestJS Server-side Analytics

To use the PostHog analytics in a NestJS application:

1 Add the `PostHogService` to your module:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PostHogService } from '@repo/analytics';

@Module({
  imports: [ConfigModule],
  providers: [PostHogService],
  exports: [PostHogService],
})
export class AppModule {}
```

2 Use the service in your application:

```typescript
import { Injectable } from '@nestjs/common';
import { PostHogService } from '@repo/analytics';

@Injectable()
export class YourService {
  constructor(private readonly posthogService: PostHogService) {}

  async doSomething(userId: string): Promise<void> {
    // Non-blocking analytics (preferred for most use cases)
    this.posthogService.captureNonBlocking(userId, 'action_performed', {
      property1: 'value1',
      property2: 42,
    });
    
    // Or if you need to wait for the analytics to be sent
    await this.posthogService.capture(userId, 'action_performed', {
      property1: 'value1',
      property2: 42,
    });
  }
}
```

## Environment Configuration

Set the following environment variables to configure PostHog:

```env
POSTHOG_API_KEY=your_api_key
POSTHOG_HOST=https://eu.i.posthog.com (or your PostHog instance URL)
```

## Testing PostHog Integration

A test script is available in the backend project to test the PostHog integration:

```bash
# From the root of the monorepo
cd apps/backend
pnpm test:posthog
```

Or with custom parameters:

```bash
pnpm test:posthog user_123 custom_event_name
```

## Non-blocking vs Blocking Analytics

This package provides two methods for sending analytics events:

- `captureNonBlocking`: Sends events without blocking the main execution flow. Preferred for most use cases.
- `capture`: Sends events and awaits their completion. Use when you need to ensure the event is sent.

Similar methods exist for identifying users and groups.

## API Reference

### PostHogService

#### Methods

- `captureNonBlocking(userId: string, event: string, properties?: PostHogProperties)`: Send an event without blocking
- `capture(userId: string, event: string, properties?: PostHogProperties)`: Send an event and await completion
- `identifyNonBlocking(userId: string, properties?: PostHogProperties)`: Identify a user without blocking
- `identify(userId: string, properties?: PostHogProperties)`: Identify a user and await completion
- `groupIdentifyNonBlocking(groupType: string, groupKey: string, properties?: PostHogProperties)`: Identify a group without blocking
- `groupIdentify(groupType: string, groupKey: string, properties?: PostHogProperties)`: Identify a group and await completion
- `flush()`: Flush all pending events to PostHog
- `shutdown()`: Shut down the PostHog client

### Types

```typescript
type PostHogProperties = Record<
  string,
  string | number | boolean | null | undefined | Record<string, any>
>;
```

## Best Practices

1. Use non-blocking methods for most analytics to prevent performance impacts
2. Use blocking methods only when necessary, such as during user registration when you need to ensure the user is tracked
3. Add detailed properties to events to make analysis more valuable
4. Use consistent naming for events across your application
