import { InvitePartnerBanner } from "@/components/InvitePartnerBanner";
import { supabase } from "@/lib/supabase";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard/$walletId")({
  async loader({ params }) {
    const { data, error } = await supabase
      .from("wallets")
      .select(
        `
        name,
        owner_id,
        partner_id,
        invitations(id),
        owner_profile:profiles!owner_id(name),
        partner_profile:profiles!partner_id(name)
      `,
      )
      .eq("id", params.walletId)
      .single();

    if (error) throw error;
    if (!data) throw notFound();

    return { ...data };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const walletData = Route.useLoaderData();

  return (
    <div>
      <InvitePartnerBanner
        ownerId={walletData.owner_id}
        partnerId={walletData.partner_id}
        invitationId={walletData.invitations?.id}
      />
      <Outlet />
    </div>
  );
}
