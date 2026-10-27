# Couples Wallet

A shared wallet app for two partners to track expenses, income, recurring transactions and budgets together.

## Project goal

This is an **educational project**. It will be open-sourced, deployed, and built on a YouTube channel to attract students and teach real-world app building.

The current priority is to **ship a working version fast**: build it, open-source it, deploy it, and launch the channel. Polish and redesigns can come later.

### v1 scope (launch)
The app is not launchable without all of these:
- **Auth**: register, login, logout.
- **Onboarding**: create a wallet and invite a partner by email.
- **Invitations**: the partner joins through the invitation flow below.
- **Transactions**: add expenses and income, and view them.
- **Summary**: one summary view on the dashboard.
- **Payments**: hosted checkout, one webhook, and the customer portal (see below).

Everything else in the routes below comes after launch: budgets, recurring transactions, charts, in-place editing, and filters and pagination on All Transactions. Push back on building any of it before v1 ships.

### Payments & hosting
- Payments are part of the initial release, kept as simple as possible: hosted checkout, one webhook, and the provider's customer portal.
- The goal is to **break even, not to make a profit**: be able to say "10 paying users" on a resume without losing money if the app is left running long term.
- Planned price: **$4.99/year per couple**, through a merchant of record (Paddle / Lemon Squeezy) so they handle sales tax and VAT.
- Keep running costs near zero: stay on free tiers and avoid anything with a fixed monthly fee. The only expected fixed cost is the domain.
- **Backend: Supabase** (free plan). It pauses projects after ~1 week of low database activity, so plan for that:
  - At deployment, set up a **keep-alive ping**: an external free cron service (e.g. cron-job.org) makes a small API request to the project every 3–4 days. Prefer this over GitHub Actions, which disables scheduled workflows after ~60 days without commits.
  - Supabase's terms and docs (checked 2026-10-22) neither allow nor forbid keep-alive pings. The pausing docs list API calls as a way to generate activity, but say "user database activity" counts, so pings may stop working. Re-check before relying on it.
  - Fallback: a paused free project can be restored from the dashboard (the docs say up to 1 year after pausing).

### Rules for Claude
- **Push back** when work drifts from this goal. Examples: perfecting UI details, premature optimization, rewriting things that already work, adding features outside the flow below, or tooling rabbit holes. Say so plainly and suggest the faster path, then let the user decide.
- Prefer popular, well-documented, mainstream tools and patterns that students can follow and that are good for YouTube.
- Keep code readable and teachable over clever.
- **Don't make changes on your own.** By default, give the user step-by-step instructions to follow. Only edit files, install packages or run setup commands when the user explicitly asks you to.

## System flow & routes

Follow these routes and redirect rules when building pages and routing. Check here before adding new routes.

### Entry / auth
- `/`: Landing page. Links to `/register` and `/login`.
- `/login`: skipped if already logged in. After login, check whether the wallet has a partner:
  - Partner present → `/dashboard/[wallet-id]`
  - No partner → `/onboarding`
- `/register` → `/onboarding`. Register asks only for email and password, to keep sign-up friction low.
- `/onboarding`: enter wallet name, your name, partner's name and partner's email → `/dashboard/[wallet-id]`

### User names
- Names live in a `public.profiles` table (one row per user, `id` → `auth.users`), so partners can see each other's names. RLS: you can read your own profile and your partner's.
- A trigger on `auth.users` creates the profile at sign-up with an empty name (`name` is nullable).
- The owner's name is set in onboarding. The partner's name is the one the owner typed in onboarding: it's stored on the invitation and copied to the partner's profile when they accept, so the partner never fills in a name form.
- Editing your own name in Settings comes after launch.

### Invitation flow (partner joining)
- `/invitation?code=12345`: invitation page, greeting the partner by the name the owner entered ("Andrea invited you, Abel"). The partner can request the invitation be sent to a different email.
- Invalid code → `/invalid-code` (message + links to homepage, login and register)
- Valid code → does an account exist?
  - Yes → `/login?code=12345` (skipped if already logged in) → `/dashboard/[wallet-id]`
  - No → `/register?code=12345` → `/dashboard/[wallet-id]`

### Dashboard: `/dashboard/[wallet-id]`
- Shows a yellow "waiting for partner" banner if the partner hasn't joined, but **all features stay enabled**.
- Contents:
  - Category-wise expense summary
  - Charts
  - Recent transactions (in-place editing)
  - Navigation
  - Month overview
  - Budget progress bars
- Navigates to: Add Transaction modal, All Transactions, Settings, Budgets.

### All Transactions: `/transactions?page=x&pageSize=y&orderBy=x&filter=...`
- In-place editing.
- Can open the Add Transaction modal.
- Links to Recurring Transactions.

### Recurring Transactions: `/transactions/recurring-transactions`
- In-place editing.
- "New Recurring Transaction" opens the Add Transaction modal.

### Settings: `/settings`
- Recurring Transactions (links to the recurring transactions page)
- Wallets & Partners
- Subscription
- Logout
- Support

### Budgets: `/budgets`

### Add Transaction Modal
A route-driven modal opened with `add?type=...` on the parent route. There are two form components, **Expense Form** and **Income Form**.

| `type`              | Form    | Routes                                                                                   |
| ------------------- | ------- | ---------------------------------------------------------------------------------------- |
| `expense`           | Expense | `/dashboard/add`, `/transactions/add`                                                    |
| `income`            | Income  | `/dashboard/add`, `/transactions/add`                                                    |
| `recurring-expense` | Expense | `/dashboard/add`, `/transactions/add`, `/settings/recurring-transactions/add`            |
| `recurring-income`  | Income  | `/dashboard/add`, `/transactions/add`, `/settings/recurring-transactions/add`            |

> Open question: the recurring transactions page lives at `/transactions/recurring-transactions`, but its add modal is listed at `/settings/recurring-transactions/add`. Confirm which path is correct.
