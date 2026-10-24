import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const [status, setStatus] = useState("Checking Supabase connection...");

  // TEMPORARY: proves the app can reach Supabase. Remove once real queries exist.
  // We have no tables yet, so we ask the Storage API for its buckets instead.
  useEffect(() => {
    supabase.storage.listBuckets().then(({ data, error }) => {
      if (error) {
        setStatus(`❌ Supabase error: ${error.message}`);
      } else {
        setStatus(`✅ Connected to Supabase (${data.length} buckets)`);
      }
    });
  }, []);

  return (
    <main className="p-8">
      <h1>Landing</h1>
      <p>{status}</p>
    </main>
  );
}
