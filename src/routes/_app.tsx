import { Container } from "@/components/Container";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Outlet, useMatch, useNavigate } from "@tanstack/react-router";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
  async beforeLoad() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
    return { session: data.session };
  },
  async loader({ context }) {
    const session = context.session;
    const { data } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", session.user.id)
      .single();

    return { userName: data?.name };
  },
});

function AppLayout() {
  return (
    <>
      <AppHeader />
      <main className="py-4">
        <Container>
          <Outlet />
        </Container>
      </main>
    </>
  );
}

function AppHeader() {
  const data = Route.useLoaderData();
  const walletMatch = useMatch({
    from: "/_app/dashboard/$walletId",
    shouldThrow: false,
  });

  const walletName = walletMatch?.loaderData?.name;
  const ownerName = walletMatch?.loaderData?.owner_profile?.name;
  const partnerName = walletMatch?.loaderData?.partner_profile?.name;

  console.log({ ownerName, partnerName });

  return (
    <Header
      walletName={walletName}
      ownerName={ownerName}
      partnerName={partnerName}
    >
      {data.userName && (
        <p>
          <span>Hello</span>,{" "}
          <strong className="font-normal">{data.userName}</strong>
        </p>
      )}
      <LogoutButton />
    </Header>
  );
}
function LogoutButton() {
  const navigate = useNavigate();
  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <Button variant="ghost" onClick={handleLogout}>
      Logout
    </Button>
  );
}
