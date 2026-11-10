import { supabase } from "@/lib/supabase";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
  validateSearch: z.object({ code: z.string().optional() }),
  async beforeLoad() {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  loaderDeps: ({ search }) => ({ code: search.code }),
  async loader({ deps }) {
    const { code } = deps;

    let partnerEmail = null;
    if (code) {
      const { data, error } = await supabase
        .rpc("find_invitation", {
          p_code: code,
        })
        .maybeSingle();

      if (error) throw error;
      if (!data) throw redirect({ to: "/invalid-invitation" });

      partnerEmail = data?.partner_email;
    }

    return { partnerEmail };
  },
});

function AuthLayout() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted p-4">
      <div className="w-full max-w-sm flex flex-col gap-2">
        <Link to="/" className="text-lg font-semibold self-start">
          💰 Couples Wallet
        </Link>
        <Outlet />
      </div>
    </main>
  );
}
