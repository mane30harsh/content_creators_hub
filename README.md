# Content Creators Hub

Production-grade platform connecting **Creators**, **Brands**, and **Admins**.

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Framework  | Next.js 15 (App Router, TypeScript) |
| Styling    | Tailwind CSS + shadcn/ui |
| Database   | PostgreSQL + Prisma ORM |
| Auth       | Auth.js (NextAuth v5) — credentials, JWT, role claims |
| Validation | Zod + React Hook Form |

## Quick Start

### Prerequisites

- Node.js 22+
- PostgreSQL 16+ (or Docker)
- npm

### Local (no Docker)

```bash
# 1. Install & configure
npm run setup

# 2. Edit .env with your database credentials
#    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/content_creators_hub"
#    AUTH_SECRET — run: npx auth secret

# 3. Migrate database
npm run prisma:migrate

# 4. Seed sample data (optional)
npm run prisma:seed

# 5. Start dev server
npm run dev
```

Visit **http://localhost:3000**.

### Docker (recommended)

```bash
# Start Postgres + app
npm run docker:up

# View logs
npm run docker:logs

# Stop
npm run docker:down

# Rebuild after changes
npm run docker:build
npm run docker:up
```

The app is at **http://localhost:3000**. The database is exposed on port **5432**.

## Seeded Accounts

All seeded accounts use password: **`password123`**

| Role       | Email                  |
|------------|------------------------|
| Admin      | admin@example.com      |
| Creator    | creator@example.com    |
| Creator    | creator2@example.com   |
| Creator    | creator3@example.com   |
| Brand      | brand@example.com      |
| Brand      | brand2@example.com     |

Sample data includes campaigns, posts, comments, likes, reviews, and notifications.

## Scripts

### Development

| Command                  | Description                        |
|--------------------------|------------------------------------|
| `npm run dev`            | Start dev server                   |
| `npm run build`          | Production build                   |
| `npm run start`          | Start production server            |
| `npm run lint`           | Run ESLint                         |
| `npm run typecheck`      | Run TypeScript type check          |
| `npm run format`         | Format code with Prettier          |

### Database

| Command                       | Description                       |
|-------------------------------|-----------------------------------|
| `npm run prisma:generate`     | Regenerate Prisma client          |
| `npm run prisma:migrate`      | Run pending migrations (dev)      |
| `npm run prisma:migrate:deploy` | Run migrations in production    |
| `npm run prisma:seed`         | Seed sample data                  |
| `npm run prisma:reset`        | Drop all data & re-run migrations |
| `npm run prisma:studio`       | Open Prisma Studio (GUI)          |
| `npm run db:setup`            | Run migrations + seed (CI/prod)   |

### Docker

| Command                 | Description              |
|-------------------------|--------------------------|
| `npm run docker:build`  | Build Docker image       |
| `npm run docker:up`     | Start containers         |
| `npm run docker:down`   | Stop containers          |
| `npm run docker:logs`   | Follow container logs    |

### Production Build

```bash
npm run build && npm run start
```

Health check: **GET /api/health**

## Project Structure

```
src/
  app/
    (auth)/                 # Login, register, password reset
    (dashboard)/            # Role-protected (creator|brand|admin)
    api/
      auth/[...nextauth]    # Auth.js handler
      register/             # Credentials sign-up
      health/               # Health check endpoint
    feed/                   # Social feed
    notifications/          # Notifications page
    posts/[id]              # Post detail
    reviews/                # Reviews
    layout.tsx              # Root layout
    page.tsx                # Landing page
    loading.tsx             # Global loading state
    error.tsx               # Global error boundary
    not-found.tsx           # 404 page
  components/
    ui/                     # shadcn primitives
    forms/                  # Auth forms
    shared/                 # UserNav, providers
    feed/                   # PostCard, PostForm, CommentSection
    notifications/          # NotificationDropdown
    messages/               # MessageUserButton (placeholder)
  lib/
    auth/                   # Auth.js config, guards
    actions/                # Server actions
    validations/            # Zod schemas
    prisma.ts               # Prisma singleton
    roles.ts                # Role constants
    logger.ts               # Logging utility
    rate-limit.ts           # In-memory rate limiter
    upload.ts               # File validation utilities
    notifications.ts        # Notification helper
    utils.ts                # cn() helper
  middleware.ts             # Edge auth + role protection
prisma/
  schema.prisma             # Full data model
  seed.ts                   # Sample data seeder
  migrations/               # Database migrations
```

## Architecture

- **Role-based routing**: Middleware blocks routes by role at the edge
- **Server action guards**: `requireUser()` / `requireRole([...])` for defense-in-depth
- **JWT sessions**: Role embedded in the token, accessible on client via `useCurrentUser()`
- **Notifications**: Triggered via `prisma.notification.create()` in server actions
- **Rate limiting**: In-memory sliding window for auth endpoints (replace with Redis for multi-instance)

## Environment Variables

| Variable              | Required | Description                    |
|-----------------------|----------|--------------------------------|
| `DATABASE_URL`        | Yes      | PostgreSQL connection string   |
| `AUTH_SECRET`         | Yes      | NextAuth JWT secret            |
| `NEXTAUTH_URL`        | Yes      | App base URL for callbacks     |
| `GOOGLE_CLIENT_ID`    | No       | Google OAuth client ID         |
| `GOOGLE_CLIENT_SECRET`| No       | Google OAuth client secret     |
| `NEXT_PUBLIC_APP_URL` | Yes      | Public-facing app URL          |
| `NEXT_PUBLIC_APP_NAME`| No       | App name (default: Content Creators Hub) |

## Adding Components (shadcn/ui)

```bash
npx shadcn@latest add dialog dropdown-menu avatar toast
```

## Health Check

```bash
curl http://localhost:3000/api/health

# Response:
# { "status": "ok", "database": "connected", "uptime": 123.45, ... }
```

## Next Steps

- Follow/Unfollow relationships
- Direct messaging (real-time)
- Creator search & discovery
- Admin panel analytics
- Email sending (verification, password reset, notifications)
- OAuth providers (Google, GitHub)
- File uploads (media, portfolios)
