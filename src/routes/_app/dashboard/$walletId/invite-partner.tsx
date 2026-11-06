import { createFileRoute, useRouter } from "@tanstack/react-router";
import z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/components/FormInput";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_app/dashboard/$walletId/invite-partner",
)({
  component: RouteComponent,
});

const invitationSchema = z.object({
  partnerName: z.string().trim().min(1, "Partner name is required."),
  partnerEmail: z.email("Enter a valid email address."),
});

type InvitationValues = z.infer<typeof invitationSchema>;

function RouteComponent() {
  const navigate = useNavigate();
  const router = useRouter();
  const { walletId } = Route.useParams();
  const form = useForm<InvitationValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: { partnerName: "", partnerEmail: "" },
  });

  async function onSubmit({ partnerName, partnerEmail }: InvitationValues) {
    const { error } = await supabase.from("invitations").upsert(
      {
        wallet_id: walletId,
        partner_name: partnerName,
        partner_email: partnerEmail,
      },
      {
        onConflict: "wallet_id",
      },
    );

    if (error) {
      form.setError("root", {
        message: "Something went wrong, please try again.",
      });
      return;
    }

    await router.invalidate();
    navigate({ from: "/dashboard/$walletId/invite-partner", to: ".." });
    toast("Invitation created successfully.");
  }

  const formRootError = form.formState.errors.root;

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open)
          navigate({ from: "/dashboard/$walletId/invite-partner", to: ".." });
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-4">Invite Your Partner 💞</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4.5">
            <FormInput
              type="text"
              name="partnerName"
              label="Partner Name"
              control={form.control}
            />

            <FormInput
              type="email"
              name="partnerEmail"
              label="Partner Email"
              control={form.control}
            />
          </FieldGroup>
          <div className="mt-6">
            <Button
              className="w-full"
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              Invite
            </Button>
            {formRootError && (
              <FieldError className="mt-3" errors={[formRootError]} />
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
