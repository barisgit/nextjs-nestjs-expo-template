# Next.js + NestJS + Expo Monorepo Template

A modern full-stack application template with real-time capabilities, type-safety across the stack, and cross-platform support.

## Tech Stack

- **Monorepo**: Turborepo
- **Backend**: NestJS, PostgreSQL, TypeORM, Socket.IO
- **Frontend (Web)**: Next.js, React, TailwindCSS, ShadCN UI, TanStack Query
- **Mobile**: Expo (React Native)
- **API Layer**: tRPC for type-safe APIs
- **Authentication**: Clerk integration
- **Analytics**: PostHog
- **Real-time**: WebSockets with Socket.IO
- **Testing**: Jest, React Testing Library

## Project Structure

```text
apps/
  ├── backend/     # NestJS API server
  ├── web/         # Next.js web application
  └── mobile/      # Expo React Native application
packages/
  ├── analytics/   # PostHog analytics integration
  ├── db/          # Database models and TypeORM configuration
  ├── services/    # Shared services (auth, redis, webhooks)
  ├── trpc/        # tRPC API router definitions and context
  ├── ui/          # Shared UI components
  ├── websockets/  # Type-safe WebSocket implementation
  ├── eslint-config/ # Shared ESLint configuration
  └── typescript-config/ # Shared TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- pnpm package manager

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/nextjs-nestjs-expo-template.git
   cd nextjs-nestjs-expo-template
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Copy the `.env.example` files in the apps directories to `.env` and update the values

4. Start development servers:

   ```bash
   # Start all applications
   pnpm dev
   
   # Or start specific applications
   pnpm dev:web    # Start Next.js app
   pnpm dev:api    # Start NestJS backend
   pnpm dev:mobile # Start Expo app
   ```

## Features

- **Modular Architecture**: Well-organized monorepo structure for code sharing
- **Type Safety**: End-to-end type safety from backend to frontend using tRPC
- **Real-time Capabilities**: WebSockets integration for real-time features
- **Cross-platform**: Web and mobile apps sharing business logic and API layer
- **Scalable Backend**: NestJS modules with dependency injection
- **Authentication**: Clerk integration for secure authentication
- **Analytics**: PostHog integration for tracking user behavior
- **Developer Experience**: Hot reloading, TypeScript, ESLint

## Documentation

Each package and application contains its own README with detailed documentation:

- [Backend Documentation](apps/backend/README.md)
- [Mobile Documentation](apps/mobile/README.md)
- [Analytics Package](packages/analytics/README.md)
- [Database Package](packages/db/README.md)
- [Services Package](packages/services/README.md)
- [tRPC Package](packages/trpc/README.md)
- [UI Package](packages/ui/README.md)
- [WebSockets Package](packages/websockets/README.md)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Turborepo](https://turbo.build/)
- [NestJS](https://nestjs.com/)
- [Next.js](https://nextjs.org/)
- [Expo](https://expo.dev/)
- [tRPC](https://trpc.io/)
- [TypeORM](https://typeorm.io/)
- [Socket.IO](https://socket.io/)
