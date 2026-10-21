# Couples Wallet

A shared wallet app for two partners to track expenses, income, recurring transactions and budgets together.

## Project goal

This is an **educational project**. It will be open-sourced, deployed, and built on a YouTube channel to attract students and teach real-world app building.

The current priority is to **ship a working version fast**: build it, open-source it, deploy it, and launch the channel. Polish and redesigns can come later.

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
- `/register` → `/onboarding`
- `/onboarding`: enter wallet name and partner's email → `/dashboard/[wallet-id]`

### Invitation flow (partner joining)
- `/invitation?code=12345`: invitation page. The partner can request the invitation be sent to a different email.
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
