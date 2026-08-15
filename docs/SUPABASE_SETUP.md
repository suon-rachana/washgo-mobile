# Supabase Setup — WashGo Phase 1

This covers the manual setup needed to run WashGo against a real Supabase
backend. Without it, the app runs fine in **mock mode** (the default) —
nothing below is required to keep developing the prototype.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**, choose an organization, name it (e.g. `washgo`),
   set a database password (save it somewhere safe — you won't need it for
   the app, only for direct DB access), and pick a region close to Siem Reap
   (e.g. Singapore).
3. Wait for provisioning to finish (a couple of minutes).

## 2. Find your project URL and anon key

In the Supabase dashboard: **Project Settings → API**.

- **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
- **anon / public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

⚠️ **Never** use the **service_role** key in this app. It bypasses Row Level
Security and must never ship inside a mobile client. It has no use in this
codebase at all — Phase 1 only ever uses the anon key.

## 3. Create `.env`

From the project root (PowerShell):

```powershell
Copy-Item .env.example .env
```

Edit `.env` and fill in the two values from step 2:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
EXPO_PUBLIC_DATA_SOURCE=supabase
```

`.env` is git-ignored — it will not be committed.

Restart the Expo dev server after editing `.env` (environment variables are
read at bundle time):

```powershell
npx expo start -c
```

## 4. Run the SQL migrations

In the Supabase dashboard: **SQL Editor → New query**. Run each file in
`supabase/migrations/` **in order** (001 → 002 → 003 → 004), pasting its full
contents and clicking **Run** before moving to the next:

1. [`001_initial_schema.sql`](../supabase/migrations/001_initial_schema.sql) —
   every table (`profiles`, `addresses`, `laundries`, `laundry_services`,
   `orders`, `order_items`, `order_status_history`, `notifications`,
   `payments`, `favorites`), the `profiles` row-creation trigger, and all
   Row Level Security policies.
2. [`002_backfill_missing_profiles.sql`](../supabase/migrations/002_backfill_missing_profiles.sql)
3. [`003_grant_authenticated_permissions.sql`](../supabase/migrations/003_grant_authenticated_permissions.sql)
4. [`004_order_creation_and_status.sql`](../supabase/migrations/004_order_creation_and_status.sql) —
   `create_order()` and `advance_order_status()`, the only way orders ever
   get written (see Phase 4 below).

If you prefer the Supabase CLI instead of the dashboard:

```powershell
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

## 5. Configure authentication

In the dashboard: **Authentication → Providers → Email** should already be
enabled by default — that's all Phase 1 needs (email + password).

### Email confirmation

**Authentication → Sign In / Providers → Email** has a "Confirm email"
toggle.

- **For local development**, it's fine to **turn email confirmation off** so
  `signUp` immediately returns an active session and you can test the full
  flow without checking an inbox.
- **Before shipping to real users**, turn it back **on** so accounts can't be
  created with someone else's email address.

## 6. Switching between mock and Supabase modes

Controlled entirely by `EXPO_PUBLIC_DATA_SOURCE` in `.env`:

```env
EXPO_PUBLIC_DATA_SOURCE=mock       # default — src/data/mock, no network calls
EXPO_PUBLIC_DATA_SOURCE=supabase   # real auth, profiles, addresses
```

Restart Expo (`npx expo start -c`) after changing it. If `EXPO_PUBLIC_DATA_SOURCE`
is missing or set to anything else, the app falls back to `mock` and logs a
warning in dev.

## 7. Regenerating TypeScript database types

[`src/types/database.ts`](../src/types/database.ts) was hand-written to
match the migration SQL, and is marked in a comment as needing
regeneration. Once your project is linked, regenerate it from the real
schema:

```powershell
npx supabase gen types typescript --project-id <your-project-ref> > src/types/database.ts
```

Re-run this any time the schema changes. The hand-written version only
includes `Insert`/`Update` shapes for the tables Phase 1 actually writes to
(`addresses`, `profiles`) — regeneration will need those narrowed back down
if you want to keep write access restricted to safe fields, since Supabase's
generator produces full-table Insert/Update types.

## 8. Security notes

- The service-role key is never referenced anywhere in this app — don't add
  it.
- Row Level Security is enabled on every table; there is no `using (true)`
  policy anywhere in the migration.
- `profiles.role` cannot be changed by the client: a trigger
  (`profiles_prevent_role_change`) silently reverts any client-attempted
  role change, and new accounts are always created with `role = 'customer'`
  regardless of what a client sends at sign-up.
- Setting a default address goes through the `set_default_address()` Postgres
  function (called via `.rpc(...)`) so "unset the old default, set the new
  one" happens atomically, respecting the same RLS policies as a normal
  update.

## 9. Manual test flow

### Mock mode

```text
Set EXPO_PUBLIC_DATA_SOURCE=mock (or leave it unset)
→ npx expo start
→ Login (any input passing local validation)
→ Navigate through the customer app
→ Edit Profile — shows the "Changes saved" banner, nothing persisted
→ Manage Addresses — same mock list as before
→ Log Out
```

### Supabase mode

```text
Complete steps 1-5 above, set EXPO_PUBLIC_DATA_SOURCE=supabase
→ npx expo start -c
→ Register a customer (full name, email, phone, password)
→ In the Supabase dashboard: Table Editor → profiles — confirm a row was
  created for the new user, with role = customer
→ Sign in
→ Personal Information → edit name/phone → Save Changes → confirm the
  "Changes saved" banner and that profiles.full_name / phone updated in
  the dashboard
→ Restart the app (Reload in Expo dev tools) → confirm you're still signed
  in and the profile still loads (session persisted via AsyncStorage)
→ Saved Addresses → Add Address → confirm it appears in the addresses table
→ Set an address as default → confirm exactly one row has is_default = true
  for that user
→ Edit an address → Delete an address (with confirmation)
→ Create a second Supabase user and confirm it cannot see the first user's
  addresses or profile (RLS)
→ Home / Laundries tab → confirm real laundries load (empty until you seed
  some — see "Recommended next phase" below)
→ Pick a laundry → Choose Services → select one of its real services →
  Pickup → choose a saved address (or Add New Address) → Schedule Pickup →
  Request Pickup → choose Cash on Delivery → Confirm Pickup
→ In the Supabase dashboard: Table Editor → orders/order_items — confirm a
  row exists with the right subtotal/total and one order_items row per
  selected service
→ Orders tab → confirm the new order appears under Active
→ Track Order → tap "Simulate Next Update (Demo)" a few times → confirm the
  timeline advances and a matching row appears in order_status_history
→ Notifications → confirm a notification appeared for each simulated step
→ Log Out → confirm the back gesture from /login cannot reopen (tabs)
```

## Current limitations (Phase 4)

- **Payments are storage-only.** `payment-methods/*` screens still show mock
  data; orders record a `payment_method` at creation but nothing actually
  charges a card. This is intentional for now — see the project roadmap.
- **No rider/laundry-shop app exists yet.** `advance_order_status()` lets a
  customer advance their own order through its lifecycle as an explicit
  demo stand-in (the tracking screen's "Simulate Next Update (Demo)"
  button) — not a real access-control model. The Tracking screen's rider
  card is shown for mock orders only, since there's no real rider data to
  show for a Supabase order.
- **No promotions table.** Real orders never apply a discount; the discount
  preview shown during booking (mock's promo banner) only appears in mock
  mode so what's previewed always matches what `create_order()` actually
  charges.
- **No dedicated "size estimate" column.** The pickup flow's size selector
  is mock-only display for now — a real column would need its own
  migration.
- Sign-in/sign-up is email + password only; the login screen's "Phone or
  Email" field only accepts an email in Supabase mode.
- Password reset has a service method (`authService.requestPasswordReset`)
  but no screen calls it yet.
- Avatar upload has a profile-service method (`updateAvatarUrl`) but no
  image picker/upload flow yet.
- `app/services/index.tsx` (Choose Services), `app/pickup/index.tsx`
  (address selection), `app/summary/index.tsx`, and `app/payment/index.tsx`
  now read/write real Supabase data end-to-end; every other booking-flow
  screen not listed here still reads mock data unless noted otherwise above.

## Recommended next phase

Laundries, services, favorites, notifications, and orders are wired up.
What's left, in rough priority order:

1. **Seed real laundry/service data** — Phase 2 wired the reads, but nothing
   has been inserted into `laundries`/`laundry_services` yet, so Supabase
   mode shows empty lists until real (or realistic placeholder) shops exist.
2. **Real payment processing** — actually charging a card/wallet via a
   payment gateway (e.g. ABA PayWay). Current scope intentionally stops at
   storing the chosen method.
3. **A real rider/laundry-shop side** to replace `advance_order_status()`'s
   customer-driven demo control with actual role-scoped status updates.
4. The smaller gaps listed above (phone auth, password reset screen, avatar
   upload flow, a real `orders.size` column).
