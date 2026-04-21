# 🇮🇹 Italy & Beyond — Trip Planner

A real-time trip planner for the Italy & London trip (May 2026). Both of you can edit from any device and see changes live.

**Stack:** Next.js + Supabase (real-time Postgres) + Vercel

---

## Setup (< 15 minutes)

### Step 1: Supabase (5 min)

1. Go to [supabase.com](https://supabase.com) and sign in (or create a free account)
2. Click **New Project** → name it `italy-trip` → pick a region close to you → set a DB password → **Create**
3. Wait ~30 seconds for it to provision
4. Go to **SQL Editor** (left sidebar) → click **New Query**
5. Open the file `supabase-migration.sql` from this repo, copy ALL of it, paste into the editor, and click **Run**
6. You should see "Success" — this creates all tables and seeds your default cities, packing lists, etc.
7. Then run `supabase-migration-v2.sql` the same way — it adds the extra columns used by the mobile redesign (cover tones, plan time/kind/ticket, flight pass details). Safe to run on existing installs; uses `IF NOT EXISTS`.
7. Go to **Settings → API** (left sidebar):
   - Copy the **Project URL** (looks like `https://abc123.supabase.co`)
   - Copy the **anon public** key (the long string)

### Step 2: GitHub (2 min)

1. Push this folder to a new GitHub repo:
   ```bash
   cd italy-trip-planner
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create italy-trip-planner --private --push
   ```
   Or just create a repo on GitHub and push manually.

### Step 3: Vercel (3 min)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project** → import your `italy-trip-planner` repo
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = (paste the Project URL from Step 1)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (paste the anon key from Step 1)
4. Click **Deploy**
5. Done! You'll get a URL like `italy-trip-planner.vercel.app`

### Step 4: Use it!

- Open the Vercel URL on your phone, iPad, laptop — any device
- Both of you open the same URL
- Edits sync in real-time (add a hotel on your phone, it appears on her iPad instantly)
- Works on any browser — Safari, Chrome, whatever
- Bookmark it or "Add to Home Screen" on iOS for an app-like experience

---

## What's inside

| Feature | Description |
|---------|-------------|
| ✈️ Flight Bookends | Departure from Toronto & return flight with date + time |
| 🏛️ City Itinerary | Add/remove cities, set arrive/depart dates, day-by-day planner |
| 🏨 Accommodation | Multiple stays per city with check-in/out, confirmation #, cost, notes |
| ⚠️ Smart Warnings | Auto-detects overlaps, gaps, overplanning, date conflicts |
| 📦 Packing List | Customizable categories & items with progress tracking |
| 💰 Budget Tracker | Manual expenses + auto-sync from hotel costs |
| 📝 Notes | Quick notes organized by city |
| 🔄 Real-time Sync | Both of you see changes instantly via Supabase Realtime |

---

## Running locally (optional)

```bash
cp .env.example .env.local
# Fill in your Supabase URL and anon key in .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Cost

- **Supabase Free Tier:** 500MB database, 2GB bandwidth, unlimited API calls — way more than enough
- **Vercel Free Tier:** Unlimited deployments for personal projects
- **Total: $0**

Buon viaggio! 🍷
# italy-trip-planner
