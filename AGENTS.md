# Repository Guidelines

## Project Structure & Module Organization
- `app/` holds the Next.js App Router routes, layouts, and API handlers (see `app/(dashboard)/` and `app/api/`).
- `components/` contains shared UI and layout components.
- `lib/` includes core utilities and domain logic (Prisma client, auth helpers, programs, calculations).
- `prisma/` stores the schema and migrations for PostgreSQL.
- `public/` contains static assets and PWA resources.
- `scripts/` houses Node scripts like icon generation.
- Root config files include `next.config.ts`, `tailwind.config.ts`, and `eslint.config.mjs`.

## Build, Test, and Development Commands
- `npm run dev` — start the local dev server at `http://localhost:3000`.
- `npm run build` — run Prisma migrations + generate the client, then build Next.js.
- `npm run start` — run the production server after a build.
- `npm run lint` — run ESLint (Next core-web-vitals + TypeScript rules).
- `npm run generate-icons` — rebuild PWA icons from the source asset.
- `npx prisma migrate dev` — apply schema changes locally and create migrations.
- `npx prisma studio` — open the Prisma DB browser.

## Coding Style & Naming Conventions
- TypeScript + React 19 with Next.js App Router.
- Use 2-space indentation and keep formatting consistent with existing files.
- Prefer server components; place interactive UI in `*-client.tsx` files with `"use client"`.
- Styling is Tailwind CSS with CSS variables and square, high-contrast UI (avoid border-radius unless existing patterns require it).

## Testing Guidelines
- No test runner is configured in `package.json` yet.
- If you add tests, document the framework and add a matching `npm run test` script; follow standard `__tests__/` or `*.test.ts(x)` naming.

## Commit & Pull Request Guidelines
- Use short, imperative, sentence-case commit summaries (e.g., “Add baseline Prisma migration”).
- PRs should include a clear description, linked issues when relevant, and screenshots for UI changes.
- Call out any schema/migration changes and required environment updates.

## Security & Configuration Tips
- Store secrets in `.env.local` and never commit them.
- Required env vars include `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `DATABASE_URL`.

## Agent-Specific Instructions
- See `CLAUDE.md` for architecture, data model, and workflow notes before making large changes.
