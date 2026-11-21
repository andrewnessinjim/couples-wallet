# Couples Wallet

A shared wallet app for two partners to track expenses, income, recurring transactions and budgets together.

## Project goal

This is an **educational project**. It will be open-sourced, deployed, and built on a YouTube channel to attract students and teach real-world app building.

**Priorities:** impressing an employer comes first, teaching comes second. The app is a portfolio piece, so when the two conflict, choose what an employer reviewing the code and the product would respect (sound data modeling, security, correctness) over what's simplest to teach.

The current priority is to **ship a working version fast**: build it, open-source it, deploy it, and launch the channel. Polish and redesigns can come later.

### v1 scope (launch)
The app is not launchable without all of these:
- **Auth**: register, login, logout.
- **Onboarding**: create a wallet (wallet name and your name).
- **Invitations**: from the dashboard, the owner invites the partner and gets a shareable link to send them (sending it by email comes after launch). The partner joins through the invitation flow below.
- **Transactions**: add expenses and income with an inline row (see "Adding transactions"), and view them.
- **Summary**: one summary view on the dashboard.
- **Payments**: hosted checkout, one webhook, and the customer portal (see below).

Everything else in the routes below comes after launch: budgets, recurring transactions, charts, in-place editing, and filters and pagination on All Transactions. Push back on building any of it before v1 ships.

### Product direction
- **Spreadsheet-like experience**: working with transactions should feel like an Excel sheet, not like filling in forms. This is the product's defining behavior, so it's in scope for v1 and isn't "UI polish" to push back on. Push back on extending it beyond what v1 needs, though.
- **Desktop only in v1** for the dashboard and transactions. No phone layout for them.
- Landing, auth, onboarding and invitation pages are simple forms and text, and must stay usable on phones: invitation links and confirmation emails are often opened there.
- The app launches at **sitdownapps.com**.

### Payments & hosting
- Payments are part of the initial release, kept as simple as possible: hosted checkout, one webhook, and the provider's customer portal.
- The goal is to **break even, not to make a profit**: be able to say "10 paying users" on a resume without losing money if the app is left running long term.
- Planned price: **$4.99/year per couple**, through a merchant of record (Paddle / Lemon Squeezy) so they handle sales tax and VAT.
- Keep running costs near zero: stay on free tiers and avoid anything with a fixed monthly fee. The only expected fixed cost is the domain (sitdownapps.com).
- **Backend: Supabase** (free plan). It pauses projects after ~1 week of low database activity, so plan for that:
  - At deployment, set up a **keep-alive ping**: an external free cron service (e.g. cron-job.org) makes a small API request to the project every 3–4 days. Prefer this over GitHub Actions, which disables scheduled workflows after ~60 days without commits.
  - Supabase's terms and docs (checked 2026-10-22) neither allow nor forbid keep-alive pings. The pausing docs list API calls as a way to generate activity, but say "user database activity" counts, so pings may stop working. Re-check before relying on it.
  - Fallback: a paused free project can be restored from the dashboard (the docs say up to 1 year after pausing).
- **Email**: production needs our own SMTP provider on a free tier (e.g. Resend) for sign-up confirmation emails. Supabase's built-in email is only meant for testing (check the current limits). Confirmation is required because `accept_invitation` trusts the user's email.

### Rules for Claude
- **Push back** when work drifts from this goal. Examples: perfecting UI details, premature optimization, rewriting things that already work, adding features outside the flow below, or tooling rabbit holes. Say so plainly and suggest the faster path, then let the user decide.
- Prefer popular, well-documented, mainstream tools and patterns that students can follow and that are good for YouTube.
- Keep code readable and teachable over clever.
- **Migrations before launch:** nothing is deployed until v1 launches, so edit existing migrations in place to keep them organized (one migration per table or concept). Only suggest a new migration for a new concept. After launch, never edit a deployed migration.
- **Don't make changes on your own.** Only edit files, install packages or run setup commands when the user explicitly asks you to.
- **Don't give solutions unless asked.** Answer the question that was asked. Only give code, fixes or step-by-step instructions when the user explicitly asks for them.

## System flow & routes

Follow these routes and redirect rules when building pages and routing. Check here before adding new routes.

### Entry / auth
- `/`: Landing page. Links to `/register` and `/login`.
- `/login`: skipped if already logged in. → `/dashboard`
- `/register` → `/dashboard`. Register asks only for email and password, to keep sign-up friction low.
- `/dashboard`: router only, no page. Does the user have a wallet (as owner or partner)?
  - Yes → `/dashboard/[wallet-id]`
  - No → `/onboarding`
- `/onboarding`: enter wallet name and your name → `/dashboard/[wallet-id]`. Done by the `create_wallet` function.
- With `?code=...` (coming from an invitation), login and register return to the invitation flow instead of going to `/dashboard`.

### User names
- Names live in a `public.profiles` table (one row per user, `id` → `auth.users`), so partners can see each other's names. RLS: you can read your own profile and your partner's.
- A trigger on `auth.users` creates the profile at sign-up with an empty name (`name` is nullable).
- The owner's name is set in onboarding. The partner's name is the one the owner typed in the invite form: it's stored on the invitation and copied to the partner's profile when they accept, so the partner never fills in a name form.
- Editing your own name (from the user menu) comes after launch.

### Invitation flow
**Owner invites:**
- On the dashboard, the "waiting for partner" banner has an **Invite Partner** action → `/dashboard/[wallet-id]/invite-partner`: partner's name and email.
- Saves a row in `invitations` (`id` = the code, `wallet_id`, `partner_name`, `partner_email`). The code must be **unguessable** (a uuid, not a short number).
- Shows the link `/invitation?code=<code>` with a **Copy link** button. The owner sends it to the partner themselves.

**Partner joins:**
- `/invitation?code=<code>` (works logged out): is the code valid?
  - Invalid (no such invitation, already used, or the wallet already has a partner) → `/invalid-code` (message + links to homepage, login and register)
  - Valid → invitation page greeting the partner by name ("Andrea invited you, Abel"), with an **Accept** button.
- Accept → is the partner logged in?
  - No → `/login?code=<code>` or `/register?code=<code>` with the email field prefilled and frozen to the invited email → back to this check.
  - Yes, but not with the invited email → mismatch message with a logout button and links to login/register.
  - Yes, with the invited email → accept the invitation → `/dashboard/[wallet-id]`

**Access & data rules:**
- Anon must **never** get a select policy on `invitations`: it would expose every invitation's names and emails. The invitation page instead calls a `security definer` function that takes one code and returns only what the page needs: the owner's name, the partner's name and the partner's email.
- `accept_invitation(code)` is a `security definer` function (with `search_path = ''`), because the partner isn't a wallet member yet, so RLS won't let them set `partner_id`. Before writing anything, it checks that the invitation exists, the caller's **confirmed** email matches `partner_email`, the wallet has no partner yet, and the caller isn't the owner. Then, in one transaction, it sets `wallets.partner_id`, copies `partner_name` into the caller's profile, and invalidates the invitation.
- After launch: send the invite link by email, and let the partner request the invitation be sent to a different email.

### Dashboard: `/dashboard/[wallet-id]`
- Shows a yellow "waiting for partner" banner with an **Invite Partner** action if the partner hasn't joined, but **all features stay enabled**.
- Contents:
  - Category-wise expense summary
  - Charts
  - Recent transactions, with an **Add** button for an inline row (in-place editing after launch)
  - Navigation
  - Month overview
  - Budget progress bars
- Navigates to: Invite Partner, All Transactions, Budgets, and the user menu items.

### All Transactions: `/transactions?page=x&pageSize=y&orderBy=x&filter=...`
- In-place editing.
- **Add** button for an inline row.
- Links to Recurring Transactions.

### Recurring Transactions: `/transactions/recurring-transactions`
- In-place editing.
- "New Recurring Transaction" adds an inline row.

### Navigation
**Main navigation (features):**
- v1: Dashboard, Transactions. Later: Recurring Transactions.
- Placement: in the header, once the user's name and Logout have moved into the user menu. If the header still feels noisy, move it to a second row below the header instead (which also leaves room for animations later).

**User menu (settings):**
- Clicking the user's name at the top right opens a popover menu. It replaces a separate `/settings` page.
- v1: Subscription, Logout.
- After launch: Wallets & Partners, Support.

### Budgets: `/budgets`

### Adding transactions (inline row)
No modal and no separate route. Clicking **Add** inserts an empty row directly in the transactions list, with a **Save** button at the end of the row. It covers both expenses and income.

> Open questions for v1:
> - Keyboard behavior: which spreadsheet keys are in v1 (e.g. Tab between cells, Enter to save) and which come later (e.g. arrow-key navigation)?
> - In-place editing is listed as after launch. Does it stay there, or move into v1 as part of the spreadsheet feel?
