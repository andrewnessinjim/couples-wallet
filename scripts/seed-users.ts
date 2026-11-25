// Creates test users in the LOCAL Supabase database.
// Runs after `supabase db reset` (see "db:reset" in package.json).

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/database.types";

// Hardcoded to the local URL on purpose, so this script can never seed production.
const LOCAL_SUPABASE_URL = "http://127.0.0.1:54321";
const USER_PASSWORD = "4fDMB6-dr8Zvb-Fvk2GH";

const secretKey = process.env.SUPABASE_SECRET_KEY;
const pubKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!secretKey) {
  throw new Error(
    "Missing SUPABASE_SECRET_KEY in .env.development (see `pnpm db:status`).",
  );
}

if (!pubKey) {
  throw new Error(
    "Missing VITE_SUPABASE_PUBLISHABLE_KEY in .env.development (see `pnpm db:status`).",
  );
}

const supabaseAdmin = createClient<Database>(LOCAL_SUPABASE_URL, secretKey);

// Fixed ids, so they stay the same after every reset.
const users = {
  andrea: {
    name: "Andrea",
    walletName: "Money Bag",
    id: "11111111-1111-1111-1111-111111111111",
    email: "andrea@coupleswallet.com",
  },
  abel: {
    name: "Abel",
    walletName: "Money Bag",
    id: "22222222-2222-2222-2222-222222222222",
    email: "abel@coupleswallet.com",
  },
  batman: {
    name: "Batman",
    walletName: "Night Vault",
    id: "33333333-3333-3333-3333-333323333333",
    email: "batman@coupleswallet.com",
  },
  catwoman: {
    name: "Catwoman",
    walletName: "Night Vault",
    id: "44444444-4444-4444-4444-444444444444",
    email: "catwoman@coupleswallet.com",
  },
};

for (const user of Object.values(users)) {
  const { error } = await supabaseAdmin.auth.admin.createUser({
    id: user.id,
    email: user.email,
    // Fixed (not random per reset), so the browser's saved password keeps working.
    password: USER_PASSWORD,
    email_confirm: true,
  });

  if (error) throw error;
  console.log(`Created ${user.email}`);
}

const supabaseClient = createClient<Database>(LOCAL_SUPABASE_URL, pubKey);

// Looks up a category of the signed-in user's wallet by name and type.
async function categoryId(category: string, type: "expense" | "income") {
  const {
    data: { id: categoryIdVal },
  } = await supabaseClient
    .from("categories")
    .select("id")
    .eq("name", category)
    .eq("type", type)
    .single()
    .throwOnError();

  return categoryIdVal;
}

type SeedTransaction = {
  day: number; // day of the current month
  description: string;
  rupees: number;
  category: string;
  type: "expense" | "income";
};

// The given day of the current month as YYYY-MM-DD, never later than today,
// so every seeded transaction falls in the month the dashboard shows.
function dayOfThisMonth(day: number) {
  const today = new Date();
  const clampedDay = Math.min(day, today.getDate());
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${String(clampedDay).padStart(2, "0")}`;
}

// Inserts the transactions as the signed-in user, so created_by is set to them.
async function insertTransactions(
  walletId: string,
  transactions: SeedTransaction[],
) {
  const rows = [];
  for (const t of transactions) {
    rows.push({
      wallet_id: walletId,
      occurred_on: dayOfThisMonth(t.day),
      description: t.description,
      amount_minor: t.rupees * 100,
      category_id: await categoryId(t.category, t.type),
    });
  }

  await supabaseClient.from("transactions").insert(rows).throwOnError();
}

// Abel signs in
const { error: signInError } = await supabaseClient.auth.signInWithPassword({
  email: users.abel.email,
  password: USER_PASSWORD,
});

if (signInError) throw signInError;

// Abel creates a wallet
const { data: walletId } = await supabaseClient
  .rpc("create_wallet", {
    p_owner_name: users.abel.name,
    p_wallet_name: users.abel.walletName,
  })
  .throwOnError();

// Abel invites Andrea
const {
  data: { id: invitationID },
} = await supabaseClient
  .from("invitations")
  .upsert(
    {
      wallet_id: walletId,
      partner_name: users.andrea.name,
      partner_email: users.andrea.email,
    },
    {
      onConflict: "wallet_id",
    },
  )
  .select("id")
  .single()
  .throwOnError();

// Andrea logs in
const { error: signInError2 } = await supabaseClient.auth.signInWithPassword({
  email: users.andrea.email,
  password: USER_PASSWORD,
});
if (signInError2) throw signInError2;

// Andrea accepts the invitation
await supabaseClient
  .rpc("accept_invitation", {
    p_code: invitationID,
  })
  .throwOnError();

// Andrea adds her transactions
await insertTransactions(walletId, [
  { day: 1, description: "Curd", rupees: 30, category: "Groceries", type: "expense" },
  { day: 2, description: "Chicken", rupees: 135, category: "Groceries", type: "expense" },
  { day: 4, description: "Curd", rupees: 29, category: "Groceries", type: "expense" },
  { day: 5, description: "Bakery", rupees: 35, category: "Dining Out", type: "expense" },
  { day: 7, description: "Chicken Shawarma", rupees: 100, category: "Dining Out", type: "expense" },
  { day: 9, description: "Vegetables", rupees: 255, category: "Groceries", type: "expense" },
  { day: 12, description: "Chicken", rupees: 330, category: "Groceries", type: "expense" },
  { day: 14, description: "Milk", rupees: 25, category: "Groceries", type: "expense" },
  { day: 17, description: "Milk", rupees: 97, category: "Groceries", type: "expense" },
  { day: 20, description: "Snacks", rupees: 120, category: "Dining Out", type: "expense" },
  { day: 23, description: "Unknown Plastic", rupees: 240, category: "Other", type: "expense" },
  { day: 26, description: "Airtel Recharge", rupees: 2249, category: "Utilities", type: "expense" },
]);

// Abel signs in again and adds his transactions
const { error: signInError3 } = await supabaseClient.auth.signInWithPassword({
  email: users.abel.email,
  password: USER_PASSWORD,
});
if (signInError3) throw signInError3;

await insertTransactions(walletId, [
  { day: 1, description: "Teaching", rupees: 1400, category: "Side income", type: "income" },
  { day: 3, description: "Auto", rupees: 85, category: "Transport", type: "expense" },
  { day: 6, description: "Auto", rupees: 120, category: "Transport", type: "expense" },
  { day: 10, description: "Auto", rupees: 140, category: "Transport", type: "expense" },
  { day: 13, description: "Bangalore Bus", rupees: 210, category: "Travel", type: "expense" },
  { day: 16, description: "Auto", rupees: 55, category: "Transport", type: "expense" },
  { day: 18, description: "Teaching", rupees: 1400, category: "Side income", type: "income" },
  { day: 25, description: "Teaching", rupees: 1400, category: "Side income", type: "income" },
]);

console.log("Andrea and Abel have a linked wallet with dummy transactions");
console.log("Batman and Catwoman do not have any wallets");
