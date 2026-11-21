# Couples Wallet

A shared wallet for couples: two partners track their expenses and income together in one place.

One partner creates the wallet and invites the other with a link. Once both have joined, they share the same transactions and a monthly summary of where their money goes. Adding transactions is meant to feel like a spreadsheet: click **Add** and type straight into a new row, with no forms and no pop-ups.

## Current status

🚧 **In active development.** Not launched yet.

**Working now:**
- Sign up with email confirmation, log in, log out
- Onboarding: create a wallet
- Partner invitations: the owner gets a shareable link, and the partner joins through it, logged in or not
- Header with the couple's initials and a user menu
- Database: wallets, profiles, invitations and categories, protected by row-level security and covered by [pgTAP](https://pgtap.org) tests

**Next, before launch:**
- Transactions: add and view expenses and income in a spreadsheet-like grid
- Dashboard summary: spending by category for the month
- Payments: a yearly subscription per couple

## Tech stack

- **Frontend:** React, TypeScript, Vite, TanStack Router, Tailwind CSS, shadcn/ui (Base UI)
- **Forms:** React Hook Form with Zod
- **Backend:** Supabase (Postgres, Auth, row-level security), with security-sensitive steps in Postgres functions
- **Tests:** pgTAP for the database

## Running it locally

### Prerequisites

- [Node.js](https://nodejs.org) 22 or later
- [pnpm](https://pnpm.io)
- [Docker](https://www.docker.com), running. The local Supabase stack runs in containers.

The Supabase CLI is installed with the project's dependencies, so you don't need to install it separately.

### Steps

1. **Install the dependencies**

   ```bash
   pnpm install
   ```

2. **Start the local Supabase stack**

   ```bash
   pnpm db:start
   ```

   The first run downloads the Docker images, which takes a few minutes.

3. **Build the database and add test users**

   ```bash
   pnpm db:reset
   ```

   This applies every migration in `supabase/migrations`, then creates two confirmed users, `andrea@coupleswallet.com` and `abel@coupleswallet.com`. Their password is in [scripts/seed-users.mjs](scripts/seed-users.mjs).

4. **Start the app**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:5173](http://localhost:5173).

You don't need to create an `.env` file: `.env.development` already contains the local Supabase URL and keys. They are the default local values, the same on every machine, and not real secrets.

### Useful local tools

| What | Where |
|---|---|
| Supabase Studio (browse tables, run SQL) | [http://127.0.0.1:54323](http://127.0.0.1:54323) |
| Emails the app sends (sign-up confirmations) | [http://127.0.0.1:54324](http://127.0.0.1:54324) |
| Local Supabase URLs and keys | `pnpm db:status` |

### Database tests

```bash
pnpm supabase test db
```

This runs the pgTAP tests in `supabase/tests` against your local database. Run `pnpm db:reset` first after changing a migration, so the tests see the latest version.

### Other scripts

| Script | What it does |
|---|---|
| `pnpm db:stop` | Stops the local Supabase stack |
| `pnpm db:types` | Regenerates the TypeScript types from the local database |
| `pnpm lint` | Lints the code with Oxlint |
| `pnpm build` | Type-checks and builds for production |
