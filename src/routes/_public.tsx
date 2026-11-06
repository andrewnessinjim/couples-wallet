import { Header } from "@/components/Header";
import { buttonVariants } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  createFileRoute,
  Link,
  Outlet,
  useMatches,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_public")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    return { session: data.session };
  },
  component: RouteComponent,
});

function PublicHeader() {
  const { session } = Route.useRouteContext();
  const hideAuthLinks = useMatches({
    select: (matches) => matches.some((m) => m.staticData.hideAuthLinks),
  });

  if (hideAuthLinks) {
    return <Header />;
  }

  return <Header>{session ? <UserLinks /> : <VisitorLinks />}</Header>;
}

function UserLinks() {
  return (
    <>
      <Link to="/dashboard" className={buttonVariants({ variant: "ghost" })}>
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

function RouteComponent() {
  return (
    <>
      <PublicHeader />
      <Outlet />
    </>
  );
}
