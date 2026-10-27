import { supabase } from "@/lib/supabase";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard/")({
  component: RouteComponent,
  async beforeLoad() {
    const { error, data } = await supabase.from("wallets").select("id");

    if (error) throw error;

    if (data.length === 0) {
      throw redirect({ to: "/onboarding" });
    }

    const walletId = data[0].id;

    throw redirect({
      to: "/dashboard/$walletId",
      params: { walletId },
    });
  },
});

function RouteComponent() {
  return <div>Hello "/dashboard/"!</div>;
}
