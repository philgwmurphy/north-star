# IRON Strength Tracker - Development Plan

## Overview

This plan outlines the upgrade of the IRON strength tracker from a single HTML file to a production-ready Next.js application with authentication, OLED-optimized design, and Vercel deployment.

---

## 1. OLED Black Design System

### Design Philosophy
**Aesthetic Direction**: Industrial minimalism meets premium fitness tech. True black backgrounds for OLED power savings, with high-contrast accent colors that "pop" against the void.

### Color Palette
```css
:root {
  /* OLED Blacks - True #000000 for maximum contrast */
  --bg-pure-black: #000000;        /* Primary background */
  --bg-surface: #0a0a0a;           /* Cards, elevated surfaces */
  --bg-elevated: #111111;          /* Modals, dropdowns */
  --bg-interactive: #1a1a1a;       /* Hover states, inputs */
  
  /* Accent Colors - High contrast for OLED */
  --accent-primary: #ff3b30;       /* iOS red - energy, strength */
  --accent-secondary: #ff9500;     /* Orange - warmth, progress */
  --accent-success: #30d158;       /* Green - completion */
  --accent-gradient: linear-gradient(135deg, #ff3b30 0%, #ff9500 100%);
  
  /* Text - Maximum readability on black */
  --text-primary: #ffffff;
  --text-secondary: #8e8e93;
  --text-muted: #48484a;
  
  /* Borders - Subtle separation */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-active: rgba(255, 59, 48, 0.5);
  
  /* Shadows - Glow effects on OLED */
  --glow-primary: 0 0 30px rgba(255, 59, 48, 0.3);
  --glow-success: 0 0 20px rgba(48, 209, 88, 0.3);
}
```

### Typography
```css
/* Display: Bebas Neue - Bold, condensed, gym aesthetic */
/* Body: Geist Sans - Modern, clean, Apple-inspired */
/* Mono: Geist Mono - For weights and numbers */

@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
/* Geist fonts via next/font for optimal loading */
```

### Key UI Changes
1. **Pure black backgrounds** (`#000000`) - Maximum OLED benefit
2. **Reduced card backgrounds** - Use `#0a0a0a` sparingly, prefer borders
3. **Glowing accents** - Box shadows with accent colors for focus states
4. **High contrast text** - Pure white on black, no gray-on-gray
5. **Minimal borders** - 1px with very low opacity, or none
6. **Subtle gradients** - On interactive elements only

---

## 2. Project Architecture

### Tech Stack
```
├── Framework:     Next.js 14 (App Router)
├── Auth:          NextAuth.js v5 (Auth.js)
├── Database:      PostgreSQL via Supabase
├── ORM:           Prisma
├── Styling:       Tailwind CSS + CSS Variables
├── State:         Zustand (lightweight, persisted)
├── Deployment:    Vercel
├── Analytics:     Vercel Analytics (optional)
```

### Directory Structure
```
iron-tracker/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx                 # Home - Quick start workout
│   │   ├── workout/
│   │   │   ├── page.tsx             # Active workout
│   │   │   └── [id]/page.tsx        # Specific workout
│   │   ├── programs/
│   │   │   └── page.tsx
│   │   ├── logs/
│   │   │   └── page.tsx
│   │   ├── metrics/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx               # Dashboard layout with nav
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts
│   │   ├── workouts/
│   │   │   └── route.ts
│   │   ├── programs/
│   │   │   └── route.ts
│   │   └── user/
│   │       └── route.ts
│   ├── layout.tsx                   # Root layout
│   └── globals.css
├── components/
│   ├── ui/                          # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   └── ...
│   ├── workout/
│   │   ├── quick-start-button.tsx
│   │   ├── active-workout.tsx
│   │   ├── exercise-card.tsx
│   │   └── set-logger.tsx
│   ├── programs/
│   │   ├── program-card.tsx
│   │   └── program-selector.tsx
│   ├── metrics/
│   │   ├── stat-card.tsx
│   │   └── progress-chart.tsx
│   └── layout/
│       ├── header.tsx
│       ├── bottom-nav.tsx
│       └── sidebar.tsx
├── lib/
│   ├── auth.ts                      # NextAuth config
│   ├── db.ts                        # Prisma client
│   ├── programs.ts                  # Program definitions
│   ├── calculations.ts              # 1RM, percentages
│   └── utils.ts
├── hooks/
│   ├── use-workout.ts
│   ├── use-timer.ts
│   └── use-media-query.ts
├── stores/
│   ├── workout-store.ts             # Active workout state
│   └── user-store.ts                # User preferences
├── prisma/
│   └── schema.prisma
├── public/
│   └── ...
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## 3. Authentication System

### NextAuth.js v5 Configuration

```typescript
// lib/auth.ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "./db"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Apple({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })
        
        if (!user?.hashedPassword) return null
        
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        )
        
        if (!isValid) return null
        
        return user
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id
      return token
    }
  }
})
```

### Database Schema (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id             String    @id @default(cuid())
  name           String?
  email          String    @unique
  emailVerified  DateTime?
  image          String?
  hashedPassword String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Fitness data
  repMaxes       RepMax[]
  workouts       Workout[]
  selectedProgram String?
  settings       UserSettings?
  
  // Auth
  accounts       Account[]
  sessions       Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model RepMax {
  id        String   @id @default(cuid())
  userId    String
  exercise  String   // squat, bench, deadlift, ohp
  weight    Float
  reps      Int
  oneRM     Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, exercise])
}

model Workout {
  id          String   @id @default(cuid())
  userId      String
  programKey  String?
  programDay  String?
  startedAt   DateTime @default(now())
  completedAt DateTime?
  notes       String?
  
  sets        WorkoutSet[]
  user        User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model WorkoutSet {
  id         String   @id @default(cuid())
  workoutId  String
  exercise   String
  weight     Float
  reps       Int
  setNumber  Int
  rpe        Int?
  isWarmup   Boolean  @default(false)
  completedAt DateTime @default(now())
  
  workout    Workout @relation(fields: [workoutId], references: [id], onDelete: Cascade)
}

model UserSettings {
  id              String  @id @default(cuid())
  userId          String  @unique
  weightUnit      String  @default("lbs") // lbs or kg
  restTimerDefault Int    @default(180)   // seconds
  darkMode        Boolean @default(true)
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Auth Pages UI

```tsx
// app/(auth)/login/page.tsx
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 
                          bg-gradient-to-br from-red-500 to-orange-500 
                          rounded-2xl mb-4 shadow-[0_0_40px_rgba(255,59,48,0.3)]">
            <span className="text-3xl">🏋️</span>
          </div>
          <h1 className="font-bebas text-5xl tracking-wider bg-gradient-to-r 
                         from-red-500 to-orange-500 bg-clip-text text-transparent">
            IRON
          </h1>
          <p className="text-gray-500 mt-2">Strength Training System</p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-8">
          <button className="w-full py-4 bg-white text-black rounded-xl 
                             font-semibold flex items-center justify-center gap-3
                             hover:bg-gray-100 transition-colors">
            <GoogleIcon /> Continue with Google
          </button>
          <button className="w-full py-4 bg-[#0a0a0a] text-white rounded-xl 
                             font-semibold flex items-center justify-center gap-3
                             border border-white/10 hover:bg-[#111] transition-colors">
            <AppleIcon /> Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-gray-500 text-sm">or</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* Email Form */}
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full py-4 px-5 bg-[#0a0a0a] rounded-xl border border-white/10
                       text-white placeholder-gray-500 focus:border-red-500/50
                       focus:ring-2 focus:ring-red-500/20 transition-all outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full py-4 px-5 bg-[#0a0a0a] rounded-xl border border-white/10
                       text-white placeholder-gray-500 focus:border-red-500/50
                       focus:ring-2 focus:ring-red-500/20 transition-all outline-none"
          />
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 
                       rounded-xl font-bold text-white shadow-[0_0_30px_rgba(255,59,48,0.3)]
                       hover:shadow-[0_0_40px_rgba(255,59,48,0.4)] transition-shadow"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-gray-500 mt-8">
          Don't have an account?{" "}
          <Link href="/register" className="text-red-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
```

---

## 4. Quick-Start Workout Feature

### Home Screen Design

The home screen prioritizes **starting a workout immediately**. The primary action is unmissable.

```tsx
// app/(dashboard)/page.tsx
export default async function HomePage() {
  const session = await auth()
  const user = await getUser(session.user.id)
  const activeWorkout = await getActiveWorkout(session.user.id)
  
  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <header className="p-6">
        <p className="text-gray-500">Welcome back</p>
        <h1 className="text-2xl font-bold">{user.name?.split(' ')[0]}</h1>
      </header>

      {/* HERO: Quick Start Button */}
      <section className="px-6 mb-8">
        {activeWorkout ? (
          <Link href={`/workout/${activeWorkout.id}`}>
            <div className="relative overflow-hidden rounded-3xl 
                            bg-gradient-to-br from-red-500/20 to-orange-500/20 
                            border border-red-500/30 p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 
                              opacity-10 animate-pulse"></div>
              <div className="relative">
                <p className="text-red-400 font-semibold mb-1">WORKOUT IN PROGRESS</p>
                <h2 className="text-2xl font-bold mb-2">{activeWorkout.programDay}</h2>
                <p className="text-gray-400">
                  {activeWorkout.sets.length} sets completed • 
                  {formatDuration(activeWorkout.startedAt)}
                </p>
                <div className="mt-4 flex items-center gap-2 text-red-400 font-semibold">
                  Continue Workout <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <QuickStartButton program={user.selectedProgram} repMaxes={user.repMaxes} />
        )}
      </section>

      {/* Today's Workout Preview */}
      {user.selectedProgram && (
        <section className="px-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Today's Workout</h2>
          <TodayWorkoutCard 
            program={user.selectedProgram} 
            repMaxes={user.repMaxes}
          />
        </section>
      )}

      {/* Quick Actions Grid */}
      <section className="px-6 mb-8">
        <div className="grid grid-cols-2 gap-3">
          <QuickActionCard 
            icon="📊" 
            label="Metrics" 
            href="/metrics" 
          />
          <QuickActionCard 
            icon="📋" 
            label="Programs" 
            href="/programs" 
          />
          <QuickActionCard 
            icon="📝" 
            label="Logs" 
            href="/logs" 
          />
          <QuickActionCard 
            icon="⚙️" 
            label="Settings" 
            href="/settings" 
          />
        </div>
      </section>

      {/* Recent Activity */}
      <section className="px-6">
        <h2 className="text-lg font-bold mb-4">Recent Workouts</h2>
        <RecentWorkoutsList userId={session.user.id} limit={3} />
      </section>
    </div>
  )
}
```

### Quick Start Button Component

```tsx
// components/workout/quick-start-button.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Play, Zap, ChevronRight } from "lucide-react"

export function QuickStartButton({ program, repMaxes }) {
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)

  const handleQuickStart = async () => {
    setIsStarting(true)
    
    // Create new workout in database
    const workout = await fetch("/api/workouts", {
      method: "POST",
      body: JSON.stringify({
        programKey: program,
        programDay: getNextWorkoutDay(program),
      }),
    }).then(r => r.json())
    
    router.push(`/workout/${workout.id}`)
  }

  if (!program || !repMaxes) {
    return (
      <Link href="/programs">
        <div className="rounded-3xl bg-[#0a0a0a] border border-white/10 p-6 
                        hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">Get Started</h2>
              <p className="text-gray-500">Set up your program to begin</p>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-500" />
          </div>
        </div>
      </Link>
    )
  }

  return (
    <button
      onClick={handleQuickStart}
      disabled={isStarting}
      className="w-full group relative overflow-hidden rounded-3xl p-8
                 bg-gradient-to-r from-red-500 to-orange-500
                 shadow-[0_0_60px_rgba(255,59,48,0.3)]
                 hover:shadow-[0_0_80px_rgba(255,59,48,0.4)]
                 active:scale-[0.98] transition-all duration-300"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative flex items-center justify-between">
        <div className="text-left">
          <div className="flex items-center gap-2 text-white/80 mb-1">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Quick Start
            </span>
          </div>
          <h2 className="text-3xl font-bebas tracking-wide text-white">
            START WORKOUT
          </h2>
          <p className="text-white/70 mt-1">
            {getNextWorkoutDay(program)} • {programs[program].name}
          </p>
        </div>
        
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur
                        flex items-center justify-center
                        group-hover:scale-110 transition-transform">
          {isStarting ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent 
                            rounded-full animate-spin" />
          ) : (
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          )}
        </div>
      </div>
    </button>
  )
}
```

---

## 5. Vercel Deployment

### Environment Variables

```bash
# .env.local (for local development)
# .env.production (set in Vercel dashboard)

# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth Providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
APPLE_CLIENT_ID="..."
APPLE_CLIENT_SECRET="..."
```

### Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXTAUTH_URL": "https://iron-tracker.vercel.app"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Deployment Steps

```bash
# 1. Initialize project
npx create-next-app@latest iron-tracker --typescript --tailwind --app

# 2. Install dependencies
cd iron-tracker
npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client
npm install bcryptjs zustand
npm install -D @types/bcryptjs

# 3. Set up Prisma
npx prisma init
# Edit schema.prisma
npx prisma generate
npx prisma db push

# 4. Connect to Vercel
npx vercel link

# 5. Set environment variables in Vercel Dashboard
# Settings > Environment Variables

# 6. Deploy
npx vercel --prod

# Or connect GitHub repo for automatic deployments
```

### Database Setup (Supabase)

1. Create new project at supabase.com
2. Go to Settings > Database
3. Copy connection string (use "Transaction pooler" for `DATABASE_URL`)
4. Copy direct connection for `DIRECT_URL`
5. Add to Vercel environment variables

---

## 6. Implementation Phases

### Phase 1: Project Setup (Day 1)
- [ ] Create Next.js project with TypeScript + Tailwind
- [ ] Configure OLED color system in Tailwind
- [ ] Set up Prisma with Supabase
- [ ] Deploy initial skeleton to Vercel

### Phase 2: Authentication (Day 2)
- [ ] Configure NextAuth.js v5
- [ ] Create login/register pages
- [ ] Add Google OAuth
- [ ] Implement email/password auth
- [ ] Add protected routes middleware

### Phase 3: Core Features (Days 3-4)
- [ ] Port program definitions from original app
- [ ] Build rep max calculator
- [ ] Create program selection flow
- [ ] Implement workout logging
- [ ] Add workout history/logs

### Phase 4: Quick Start & UX (Day 5)
- [ ] Build home screen with quick start
- [ ] Create active workout experience
- [ ] Add rest timer
- [ ] Implement set logging with swipe gestures
- [ ] Add workout completion flow

### Phase 5: Polish & Deploy (Day 6)
- [ ] Add metrics/analytics page
- [ ] Implement settings page
- [ ] Mobile responsiveness pass
- [ ] Performance optimization
- [ ] Final Vercel deployment

---

## 7. Key Files to Create First

```bash
# Priority order for implementation:

1. tailwind.config.ts          # OLED color system
2. app/globals.css             # Base styles
3. prisma/schema.prisma        # Database schema
4. lib/auth.ts                 # NextAuth config
5. app/(auth)/login/page.tsx   # Login page
6. app/(dashboard)/page.tsx    # Home with quick start
7. components/workout/quick-start-button.tsx
8. lib/programs.ts             # Program definitions
9. app/api/workouts/route.ts   # Workout CRUD
10. app/(dashboard)/workout/[id]/page.tsx  # Active workout
```

---

## Summary

This plan transforms your single-file HTML app into a production-ready Next.js application with:

1. **OLED Black Design** - True `#000000` backgrounds, glowing accents, high contrast
2. **User Auth** - NextAuth.js v5 with Google, Apple, and email/password
3. **Quick Start Workflow** - One-tap workout initiation from home screen
4. **Vercel Deployment** - PostgreSQL via Supabase, environment-based config
