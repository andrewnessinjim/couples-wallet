// Creates test users in the LOCAL Supabase database.
// Runs after `supabase db reset` (see "db:reset" in package.json).

import { createClient } from "@supabase/supabase-js";

// Hardcoded to the local URL on purpose, so this script can never seed production.
const LOCAL_SUPABASE_URL = "http://127.0.0.1:54321";

const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!secretKey) {
  throw new Error(
    "Missing SUPABASE_SECRET_KEY in .env.development (see `pnpm db:status`).",
  );
}

const supabase = createClient(LOCAL_SUPABASE_URL, secretKey);

// Fixed ids, so they stay the same after every reset.
const users = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    email: "andrea@coupleswallet.com",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    email: "abel@coupleswallet.com",
  },
];

for (const user of users) {
  const { error } = await supabase.auth.admin.createUser({
    id: user.id,
    email: user.email,
    // Fixed (not random per reset), so the browser's saved password keeps working.
    password: "4fDMB6-dr8Zvb-Fvk2GH",
    email_confirm: true,
  });

  if (error) throw error;
  console.log(`Created ${user.email}`);
}
