import { Container } from "@/components/Container";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
  async beforeLoad() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
  },
});

function AppLayout() {
  return (
    <>
      <AppHeader />
      <main className="py-8">
        <Container>
          <Outlet />
        </Container>
      </main>
    </>
  );
}

function AppHeader() {
  return (
    <Header>
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
