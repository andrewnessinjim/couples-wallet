import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const Route = createFileRoute("/_app/onboarding/")({
  component: OnboardingPage,
});

const onboardingSchema = z.object({
  walletName: z.string().min(4, "At least 4 characters."),
  name: z.string().min(1, "Name is required."),
  partnerName: z.string().min(1, "Partner name is required."),
  partnerEmail: z.email("Enter a valid email address."),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

function OnboardingPage() {
  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      walletName: "Money Bag",
      name: "",
      partnerName: "",
      partnerEmail: "",
    },
  });
  const navigate = useNavigate();

  async function onSubmit({ walletName }: OnboardingValues) {
    const { data, error } = await supabase
      .from("wallets")
      .insert({ name: walletName })
      .select("id")
      .single();

    if (error) {
      console.error(error);
      form.setError("root", {
        message: "Could not create your wallet. Please try again.",
      });
      return;
    }

    navigate({
      to: "/dashboard/$walletId",
      params: {
        walletId: data.id,
      },
    });
  }

  const formRootError = form.formState.errors.root;

  return (
    <section className="max-w-sm mx-auto px-2">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        Create Your Wallet
      </h1>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldGroup className="gap-4.5">
          <FormInput
            type="text"
            name="walletName"
            label="Wallet Name"
            control={form.control}
          />
          <FormInput
            type="text"
            name="name"
            label="Your Name"
            control={form.control}
          />

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
            Create
          </Button>
          {formRootError && (
            <FieldError className="mt-3" errors={[formRootError]} />
          )}
        </div>
      </form>
    </section>
  );
}
