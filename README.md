# App Template

A modern application template with real-time multiplayer features.

## Tech Stack

- **Monorepo**: Turborepo
- **Backend**: NestJS, PostgreSQL, TypeORM, Socket.IO
- **Frontend (Web)**: Next.js, React, TailwindCSS, ShadCN UI, TanStack Query
- **Mobile**: Expo (React Native), tRPC
- **Authentication**: Kinde/Clerk (managed auth)
- **Payments**: Stripe
- **Analytics**: PostHog
- **Testing**: Jest, React Testing Library

## Project Structure

```text
apps/
  ├── backend (NestJS API)
  ├── web (Next.js Web App)
  └── mobile (Expo React Native App)
packages/
  ├── api (Shared tRPC types & schemas)
  └── ui (Shared components)
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/app-template.git
   cd app-template
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Create a `.env` file in each app directory following the examples

4. Start development servers:

   ```bash
   pnpm dev
   ```

## Features

- Real-time multiplayer features (example: collaborative editing, games)
- User authentication and profiles
- Leaderboards and scoring system (example)
- Premium content through subscription model
- Mobile companion app

## Development

This project uses a Turborepo monorepo structure with TypeScript throughout the stack.
