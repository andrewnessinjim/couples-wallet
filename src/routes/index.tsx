import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/Container";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    return { session: data.session };
  },
  component: LandingPage,
});

function LandingHeader() {
  const { session } = Route.useRouteContext();
  return (
    <Header>{session ? <UserLinks /> : <VisitorLinks />}</Header>
  );
}

function UserLinks() {
  return (
    <>
      <Link to="/dashboard" className={buttonVariants()}>
        Dashboard
      </Link>
    </>
  );
}

function VisitorLinks() {
  return (
    <>
      <Link to="/login" className={buttonVariants({ variant: "ghost" })}>
        Log in
      </Link>
      <Link to="/register" className={buttonVariants()}>
        Register
      </Link>
    </>
  );
}

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
    <>
      <LandingHeader />
      <main className="py-8">
        <Container>
          <h1>Landing</h1>
          <p>{status}</p>
        </Container>
      </main>
    </>
  );
}
