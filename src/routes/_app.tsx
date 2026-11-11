import { Container } from "@/components/Container";
import { Header } from "@/components/Header";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Outlet, useMatch, useNavigate } from "@tanstack/react-router";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { cn } from "cn";

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

  return (
    <Header
      walletName={walletName}
      ownerName={ownerName}
      partnerName={partnerName}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(buttonVariants({ size: "icon" }), "rounded-full")}
        >
          <span className="sr-only">Account Menu</span>

          <span className="text-2xl font-semibold">
            {data.userName ? (
              data.userName[0]
            ) : (
              <HugeiconsIcon icon={UserIcon} />
            )}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <LogoutMenuItem />
        </DropdownMenuContent>
      </DropdownMenu>
    </Header>
  );
}
function LogoutMenuItem() {
  const navigate = useNavigate();
  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>;
}
