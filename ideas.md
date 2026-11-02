# Ideas for Later

## Design

1. When an invitation is clicked, create a cute animation where a heart (or a mascot) is waiting for another mascot in the invitation acceptance page.
2. Confetti or a small celebration animation when both partners have joined the wallet.
3. A friendly illustration on the login and register pages.
4. Animated budget progress bars that fill up on the dashboard.
5. Dark mode toggle (theme colors already support it).
6. Revisit fonts: try a display font (like Playfair Display) for headings only, once the dashboard exists.
7. Outer page padding on phones: consider px instead of rem if users with large font settings find layouts cramped.
8. Dashboard header: make the logo smaller and show the wallet's name in its place. The header lives in the shared `_app` layout, which doesn't know the current wallet, so the name has to be passed up from the `$walletId` route (e.g. via the route match) or the header moved into each page. For v1, the wallet name is the dashboard's page heading instead.
9. A welcome moment after onboarding: the "Hello, name" greeting in the header appears abruptly when onboarding finishes. Animate it in (a fade or slide, maybe with the confetti from item 2). `tw-animate-css` is already installed, so `animate-in fade-in` classes are a quick start.

> Video idea: turn these into a "giving the app personality" redesign series, with before and after.

## Features

1. Send the invite link by email (v1 only shows a "Copy link" button). Use the same SMTP provider as the sign-up confirmation emails, called from an Edge Function.
2. Let the partner request the invitation be sent to a different email.

## Tooling

1. Better SQL editing in VS Code. The built-in SQL support doesn't catch errors like missing semicolons, and it doesn't highlight PL/pgSQL keywords (`raise`, `exception`) because the `$$` function body is treated as a string. Try the **Postgres Language Server** extension (by Supabase) for error checking and the **PostgreSQL** extension (by Microsoft) for highlighting and autocomplete, connected to the local database. Until then, `pnpm db:reset` is the real check.