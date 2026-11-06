import { Alert, AlertAction, AlertDescription, AlertTitle } from "./ui/alert";

import { Link, useRouter } from "@tanstack/react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import type React from "react";
import { toast } from "sonner";

interface Props {
  ownerId?: string | null;
  partnerId?: string | null;
  invitationId?: string | null;
}

export function InvitePartnerBanner({
  ownerId,
  partnerId,
  invitationId,
}: Props) {
  if (ownerId && partnerId) {
    return null;
  }
  if (!invitationId) {
    return <InvitationMissingBanner />;
  }

  if (!partnerId) {
    return <AwaitingPartnerBanner invitationId={invitationId} />;
  }
}

function AwaitingPartnerBanner({ invitationId }: { invitationId: string }) {
  const router = useRouter();
  const path = router.buildLocation({
    to: "/invitation",
    search: { code: invitationId },
  }).href;
  const url = window.location.origin + path;

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    toast("Link copied");
  }

  return (
    <GenericBanner
      title="Share the following link with your partner."
      description={
        <div className="flex gap-3 items-baseline">
          <p className="mb-0! p-0">{url}</p>
          <Button
            className="text-gray-950"
            variant="outline"
            onClick={handleCopy}
          >
            Copy
          </Button>
        </div>
      }
      actions={
        <Link
          className={buttonVariants()}
          from="/dashboard/$walletId"
          to="./invite-partner"
        >
          Edit
        </Link>
      }
    />
  );
}

function InvitationMissingBanner() {
  return (
    <GenericBanner
      title="Invite your partner to share your wallet."
      description="Once they join, you'll both see and add transactions in one place."
      actions={
        <Link
          className={buttonVariants()}
          from="/dashboard/$walletId"
          to="./invite-partner"
        >
          Invite
        </Link>
      }
    />
  );
}

interface GenericBannerProps {
  title: string;
  description: React.ReactNode;
  actions: React.ReactNode;
}

function GenericBanner({ title, description, actions }: GenericBannerProps) {
  return (
    <Alert className="bg-amber-100">
      <AlertTitle className="text-amber-950">{title}</AlertTitle>
      <AlertDescription className="text-amber-800">
        {description}
      </AlertDescription>
      <AlertAction>{actions}</AlertAction>
    </Alert>
  );
}
