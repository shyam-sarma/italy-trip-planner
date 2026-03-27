# Setup To-Do List (Do These When You Get Home)

## Step 1: Reconnect Vercel to the Correct Repo
1. Go to https://vercel.com/dashboard
2. Click on your italy-trip-planner project
3. Go to **Settings** → **Git** (left sidebar)
4. **Disconnect** the current repo (`shyam_italy-trip-planner`)
5. **Connect** to `italy-trip-planner` (the one we've been working on)
6. Vercel will auto-deploy from the `main` branch

## Step 2: Check Vercel Environment Variables
After reconnecting, make sure these are still set:
1. Go to **Settings** → **Environment Variables**
2. Verify these exist (if not, re-add them):
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon public key
3. Add this NEW variable for the AI booking parser:
   - `ANTHROPIC_API_KEY` = your Anthropic API key (get one at https://console.anthropic.com)
   - **Important:** Do NOT prefix with `NEXT_PUBLIC_` — this must stay server-side only

## Step 3: Run Supabase Migration V2 (New Feature Tables)
1. Go to your Supabase dashboard → **SQL Editor**
2. Click **New Query**
3. Open the file `supabase-migration-v2.sql` from the repo
4. Copy ALL of it, paste into the editor
5. Click **Run**
6. You should see "Success"

This creates 3 new tables needed for:
- **Transport** tab (trains, buses, ferries between cities)
- **Eats** tab (restaurant/cafe bookmarks)
- **Photos** tab (photo journal)

## Step 4: Run Supabase Migration V3 (Document Vault)
1. Still in Supabase **SQL Editor** → **New Query**
2. Open the file `supabase-migration-v3.sql` from the repo
3. Copy ALL of it, paste into the editor
4. Click **Run**
5. You should see "Success"

This creates the `documents` table needed for:
- **Imports** tab (AI booking parser + document vault)

## Step 4b: Run Supabase Migration V4 (Flight Legs)
1. Still in Supabase **SQL Editor** → **New Query**
2. Open the file `supabase-migration-v4.sql` from the repo
3. Copy ALL of it, paste into the editor
4. Click **Run**
5. You should see "Success"

This creates the `flight_legs` table needed for:
- Multi-leg flight display (boarding pass style)
- Flight edit modal

## Step 5: Get an Anthropic API Key (for AI Booking Parser)
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Go to **API Keys** → **Create Key**
4. Copy the key
5. Add it to Vercel (Step 2 above) as `ANTHROPIC_API_KEY`
6. The AI booking parser uses Claude Haiku (~$0.01 per parse, very cheap)

## Step 6: Verify Everything Works
1. Open your Vercel deployment URL
2. Check each tab loads without errors:
   - ✅ Itinerary (countdown timer, weather badges, drag-and-drop)
   - ✅ Transport (add a test train segment)
   - ✅ Eats (add a test restaurant)
   - ✅ Packing (existing feature)
   - ✅ Budget (existing feature)
   - ✅ Map (should show your route)
   - ✅ Notes (search bar should work)
   - ✅ Photos (add a test photo URL)
   - ✅ Currency (should show live rates)
   - ✅ Phrases (Italian phrase book)
   - ✅ Imports (paste a booking confirmation to test AI parser)
3. Test dark mode toggle (top right)
4. Test on your phone (bottom nav should appear)

## Order Matters!
Do these in order: Step 1 → 2 → 3 → 4 → 5 → 6
Steps 3 and 4 can be done together (paste both SQL files one after another).
