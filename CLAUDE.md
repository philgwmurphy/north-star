# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

North Star is a strength training workout tracker built with Next.js 16 (App Router), React 19, TypeScript, and Prisma ORM with PostgreSQL. It uses Clerk for authentication and is deployed as a PWA.

## Commands

```bash
npm run dev              # Start development server (localhost:3000)
npm run build            # Production build (runs Prisma migrations + generate + Next.js build)
npm run lint             # Run ESLint
npm run generate-icons   # Generate PWA icons from source
```

**Database:**
```bash
npx prisma migrate dev   # Run migrations in development
npx prisma generate      # Regenerate Prisma client (runs automatically on npm install)
npx prisma studio        # Open database browser
```

## Architecture

### Route Structure

- `app/(dashboard)/` - Protected routes (workout, programs, program-builder, logs, metrics, settings)
- `app/api/` - API routes for workouts, user data, templates, and custom programs
- `app/sign-in/`, `app/sign-up/` - Clerk authentication pages

### Key Patterns

**Server/Client Split:** Page components are async server components that fetch data via Prisma. Interactive features use separate `*-client.tsx` components marked with `"use client"`.

**Authentication:** Clerk handles auth. Use helpers from `lib/auth.ts`:
- `requireAuth()` - Throws if not authenticated
- `getUserId()` - Returns current user ID

**Database Access:** Use the Prisma singleton from `lib/db.ts`. Users are auto-created on first API call to `/api/user` by syncing Clerk profile data.

### Core Libraries

- `lib/exercises.ts` - Exercise database (~150+ exercises by category)
- `lib/programs.ts` - Training program definitions (5/3/1, nSuns, custom)
- `lib/utils.ts` - Fitness calculations (1RM with Epley formula, training max, volume)

### Data Models

Key Prisma models: User, RepMax (1RM tracking), Workout, WorkoutSet, WorkoutTemplate, CustomProgram, UserSettings, BodyWeight

### Styling

OLED-optimized design using Tailwind CSS with CSS variables. Pure black backgrounds (#000000), no border-radius (square design), high contrast text. Fonts: Bebas Neue (display), Geist Sans (body), Geist Mono (numbers).

## Environment Variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=postgresql://...
```
