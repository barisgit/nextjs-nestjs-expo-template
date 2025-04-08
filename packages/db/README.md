# Database Package

This package provides database connectivity, entity definitions, and migration tools using TypeORM and PostgreSQL.

## Features

- TypeORM integration with NestJS
- Entity definitions with TypeScript classes
- Database migration support
- Repository pattern implementation
- Connection pooling and optimal configuration

## Installation

The package is included in the monorepo. It can be imported into any other package or app within the repo:

```json
{
  "dependencies": {
    "@repo/db": "workspace:*"
  }
}
```

## Usage

### NestJS Integration

Import the `DatabaseModule` in your NestJS application:

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@repo/db';

@Module({
  imports: [DatabaseModule],
})
export class AppModule {}
```

### Using Entities

Import entity classes directly:

```typescript
import { User } from '@repo/db/entities/user.entity';
```

### Using Repositories

Inject repositories using NestJS dependency injection:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@repo/db/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
}
```

## Environment Configuration

Set the following environment variables to configure the database connection:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=app_development
```

## Migrations

### Creating Migrations

To generate a new migration after entity changes:

```bash
# From the root of the monorepo
cd packages/db
pnpm migration:generate MigrationName
```

### Running Migrations

To run pending migrations:

```bash
# From the packages/db directory
pnpm migration:run
```

### Reverting Migrations

To revert the last applied migration:

```bash
# From the packages/db directory
pnpm migration:revert
```

## Database Schema

The package includes the following entity types:

- User - User account information
- Profile - User profile details
- Additional entities as needed for the application

## Data Source Configuration

The data source is configured in `data-source.ts` and can be imported directly if needed:

```typescript
import { AppDataSource } from '@repo/db/data-source';
```

## Best Practices

1. Always use TypeORM repositories instead of direct SQL queries
2. Create entity classes with proper validation decorators
3. Use migrations for all database schema changes
4. Add indexes to commonly queried fields
5. Use transactions for operations that require atomicity
