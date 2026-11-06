import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createFileRoute,
  redirect,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const Route = createFileRoute("/_app/onboarding/")({
  component: OnboardingPage,
  async beforeLoad() {
    const { data } = await supabase.from("wallets").select("id").limit(1);

    if (data && data.length == 1) {
      throw redirect({ to: "/dashboard" });
    }
  },
});

const WALLET_MAX_LENGTH = 50;
const NAME_MAX_LENGTH = 50;

const onboardingSchema = z.object({
  walletName: z
    .string()
    .trim()
    .min(1, "Wallet name is required.")
    .max(WALLET_MAX_LENGTH, `Must be at most ${WALLET_MAX_LENGTH} characters.`),
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(NAME_MAX_LENGTH, `Must be at most ${NAME_MAX_LENGTH} characters.`),
  partnerName: z.string().trim().min(1, "Partner name is required."),
  partnerEmail: z.email("Enter a valid email address."),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

function OnboardingPage() {
  const router = useRouter();
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

  async function onSubmit({ walletName, name }: OnboardingValues) {
    const { data: walletId, error } = await supabase.rpc("create_wallet", {
      p_owner_name: name,
      p_wallet_name: walletName,
    });

    if (error) {
      console.error(error);
      form.setError("root", {
        message: "Could not create your wallet. Please try again.",
      });
      return;
    }

    router.invalidate();

    navigate({
      to: "/dashboard/$walletId",
      params: {
        walletId,
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
            maxLength={WALLET_MAX_LENGTH}
          />
          <FormInput
            type="text"
            name="name"
            label="Your Name"
            control={form.control}
            maxLength={NAME_MAX_LENGTH}
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
