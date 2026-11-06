import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Container } from "@/components/Container";


export const Route = createFileRoute("/_public/")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    return { session: data.session };
  },
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
    <main className="py-8">
      <Container>
        <h1>Landing</h1>
        <p>{status}</p>
      </Container>
    </main>
  );
}
