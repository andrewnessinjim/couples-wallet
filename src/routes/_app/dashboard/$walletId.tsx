import { supabase } from "@/lib/supabase";
import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard/$walletId")({
  async loader({ params }) {
    const { data, error } = await supabase
      .from("wallets")
      .select("name")
      .eq("id", params.walletId)
      .single();

    if (error) throw error;
    if (!data) throw notFound();

    return { name: data.name };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello</div>;
}
