# FitLife Demo App

A standalone, self-contained demo of the FitLife fitness tracking application — built for evaluation purposes.

> **Confidentiality boundary**: This folder contains no production database credentials, no private Supabase secrets from the main app, no Prisma schema, and no proprietary business logic from the main FitLife codebase. It uses its own separate Supabase project and is safe to share as a standalone repository or Vercel deployment.

---

## Live Demo

> Once deployed, share this link with your evaluator:
> **https://your-fitlife-demo.vercel.app**

**Test credentials**: `demo@fitlife.app` / `Demo123!`

---

## Features

| Page | Description |
|---|---|
| Sign Up / Log In / Log Out | JWT auth via `httpOnly` cookie |
| Dashboard | Progress rings (activity, calories), macro bars, lifetime stats |
| Activity Log | Add workouts (type, duration, calories, notes) — history + delete |
| Food Diary | Log meals with macros — daily totals per meal type |
| AI Coach | Chat interface — Groq llama3 if key set, smart fallback otherwise |
| Challenges | 8 auto-tracked challenges based on your real logged data |

---

## Setup: One-Time Steps

### 1 — Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) → New project (free tier is fine)
2. Copy your **Project URL** and **service_role** key (Settings → API)

### 2 — Create the database schema

In your Supabase dashboard → **SQL Editor** → New query → paste the contents of [`supabase/schema.sql`](supabase/schema.sql) → **Run**.

### 3 — Set environment variables

```bash
cp .env.example .env.local
# then edit .env.local with your Supabase values
```

---

## Local Development

```bash
cd doctor-demo
npm install
node scripts/seed.mjs   # seeds demo@fitlife.app / Demo123! + sample data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Push `doctor-demo/` as a **separate GitHub repo** (or add it to a monorepo)
2. Import the repo in [vercel.com/new](https://vercel.com/new)
3. If inside a monorepo, set **Root Directory** → `doctor-demo`
4. Add these environment variables in Vercel dashboard:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role (secret) |
| `JWT_SECRET` | Any random 32-char string |
| `GROQ_API_KEY` | Optional — [console.groq.com](https://console.groq.com) |

5. Deploy → copy the Vercel URL

> **Note**: The Supabase project used here is **separate** from the main FitLife production database. No production data is exposed.

---

## Project Structure

```
doctor-demo/
├── app/
│   ├── (auth)/          ← Login & Signup (no sidebar)
│   ├── (app)/           ← Protected pages with sidebar
│   │   ├── dashboard/
│   │   ├── activity/
│   │   ├── food/
│   │   ├── coach/
│   │   └── challenges/
│   ├── api/             ← REST API routes
│   └── components/      ← Sidebar, ProgressRing
├── lib/
│   ├── db.ts            ← Supabase client (service role)
│   ├── auth.ts          ← JWT session helpers (jose)
│   └── ai.ts            ← Groq + keyword fallback coach
├── supabase/
│   └── schema.sql       ← Run once in Supabase SQL Editor
├── middleware.ts         ← Protects app routes
└── scripts/seed.mjs     ← Seeds demo user + sample data
```

---

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** (indigo/purple brand theme)
- **@supabase/supabase-js** — Postgres on Supabase cloud
- **jose** — JWT signing/verification (edge-compatible)
- **bcryptjs** — Password hashing
- **groq-sdk** — Optional Groq LLM for AI coach

No Prisma, no shared modules from the main app, no production credentials.
