# Content Creators Hub

Production-grade foundation for a platform connecting **Creators**, **Brands**,
and **Admins**. This repo is intentionally scoped to a clean, scalable
starting point — feature modules build on top of it.

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** + **shadcn/ui**
- **PostgreSQL** + **Prisma ORM**
- **Auth.js (NextAuth v5)** — credentials provider, JWT sessions, role claims
- **Zod** — schema validation
- **React Hook Form** — form state, wired to Zod via `@hookform/resolvers`

## Folder Structure

```
src/
  app/
    (auth)/login, (auth)/register      # public auth routes
    (dashboard)/creator|brand|admin    # role-protected routes
    api/auth/[...nextauth]             # Auth.js route handler
    api/register                       # credentials sign-up endpoint
    unauthorized/                      # 403-style landing page
    layout.tsx, page.tsx, globals.css
  components/
    ui/                                # shadcn primitives (button, input, form...)
    forms/                             # feature forms (login, register)
    shared/                            # cross-cutting components (auth card, providers)
  lib/
    auth/                              # Auth.js config, guards, barrel export
    validations/                       # Zod schemas
    prisma.ts                          # Prisma client singleton
    roles.ts                           # role constants shared by client & server
    utils.ts                           # cn() helper
  hooks/                               # client hooks (useCurrentUser)
  types/                               # NextAuth module augmentation
  middleware.ts                        # edge-level route protection by role
prisma/
  schema.prisma                        # User, Role enum, Creator/Brand profiles
  seed.ts                              # seeds one user per role
```

## Role-Based Architecture

- `Role` enum in Prisma: `CREATOR`, `BRAND`, `ADMIN`.
- Role is embedded in the JWT and session (`session.user.role`).
- **Middleware** (`src/middleware.ts`) blocks `/creator`, `/brand`, `/admin`
  prefixes at the edge based on role.
- **Server-side guards** (`src/lib/auth/guards.ts`) — `requireUser()` /
  `requireRole([...])` — for defense-in-depth inside Server Components and
  Route Handlers.
- Extend this by adding role-specific Prisma models (`CreatorProfile`,
  `BrandProfile` already scaffolded) and gating UI with `useCurrentUser()` on
  the client.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in:
- `DATABASE_URL` — your PostgreSQL connection string
- `AUTH_SECRET` — generate with `npx auth secret`
- `NEXTAUTH_URL` — `http://localhost:3000` for local dev

### 3. Set up the database

```bash
npm run prisma:migrate    # creates tables from schema.prisma
npm run prisma:seed       # optional: seeds creator/brand/admin test users
```

Seeded accounts (password: `password123`):
- `admin@example.com`
- `creator@example.com`
- `brand@example.com`

### 4. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Adding shadcn/ui Components

The base primitives (`button`, `input`, `label`, `card`, `form`, `select`)
are already in `src/components/ui`. To add more:

```bash
npx shadcn@latest add dialog dropdown-menu avatar toast
```

## Scripts

| Command                  | Description                          |
|---------------------------|---------------------------------------|
| `npm run dev`              | Start dev server                     |
| `npm run build`            | Production build                     |
| `npm run start`            | Start production server              |
| `npm run lint`              | Run ESLint                           |
| `npm run prisma:generate`   | Regenerate Prisma client             |
| `npm run prisma:migrate`    | Run migrations (dev)                 |
| `npm run prisma:studio`     | Open Prisma Studio                   |
| `npm run prisma:seed`       | Seed the database                    |

## Next Steps (Not Built Yet — By Design)

This scaffold deliberately stops short of feature work. Natural next steps:
- Campaign / collaboration domain models
- File uploads (media, portfolios)
- Messaging between creators and brands
- Admin moderation tooling
- Email verification & password reset flows
- OAuth providers (Google, etc.) — provider slot already in `lib/auth/config.ts`
