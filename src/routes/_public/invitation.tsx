import { Container } from "@/components/Container";
import { Button, buttonVariants } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { supabase } from "@/lib/supabase";
import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import z from "zod";
import { HugeiconsIcon } from "@hugeicons/react";
import { MailLove02Icon } from "@hugeicons/core-free-icons";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const ERROR_MESSAGES: Record<
  string,
  (ctx: { email: string; partnerEmail: string }) => string
> = {
  CW001: () =>
    "This is not a valid invitation. Please ask your partner to share a valid link.",
  CW002: ({ partnerEmail }) =>
    `This invitation is for ${partnerEmail}. Please send the invitation to them. If you share the same browser with them, please log out first so they can log in.`,
  CW003: ({ email, partnerEmail }) =>
    `You are logged in as ${email}, but this invitation is for ${partnerEmail}. Please log out and log in with ${partnerEmail}.`,
  CW004: ({ email }) =>
    `Please confirm your email ${email} first. Check your inbox for the confirmation link.`,
  CW005: () =>
    "You already have a wallet. Joining a second wallet isn't supported yet.",
  CW006: () => "Someone already joined this wallet.",
};

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";
export const Route = createFileRoute("/_public/invitation")({
  staticData: { hideAuthLinks: true },
  validateSearch: z.object({ code: z.string().catch("") }),
  async beforeLoad({ search }) {
    const invitationCode = search.code;
    const { data: invitationData, error } = await supabase
      .rpc("find_invitation", {
        p_code: invitationCode,
      })
      .maybeSingle();

    if (error) throw error;
    if (!invitationData) throw redirect({ to: "/invalid-invitation" });

    const { data: sessionData } = await supabase.auth.getSession();
    const loggedInUserEmail = sessionData.session?.user.email;

    return { invitationData, loggedInUserEmail };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { invitationData, loggedInUserEmail } = Route.useRouteContext();
  const { partner_name, owner_name, wallet_name, partner_email } =
    invitationData;
  return (
    <main className="py-8">
      <Container>
        <div className="max-w-md mx-auto flex flex-col gap-3">
          <div className="flex justify-center">
            <HugeiconsIcon
              icon={MailLove02Icon}
              className="size-12 text-primary-300"
            />
          </div>
          {loggedInUserEmail && loggedInUserEmail !== partner_email ? (
            <LogoutSection />
          ) : (
            <>
              <h1 className="text-3xl font-bold">Hello {partner_name}</h1>
              <p>
                <strong>{owner_name}</strong> invited you to join{" "}
                <strong>{wallet_name}</strong>, your shared wallet.
              </p>
              <p>If you don't recognize the invitation, please ignore it.</p>
              <ActionSection />
            </>
          )}
        </div>
      </Container>
    </main>
  );
}

function ActionSection() {
  const {
    invitationData: { partner_has_account, partner_email },
    loggedInUserEmail,
  } = Route.useRouteContext();

  if (!loggedInUserEmail) {
    return partner_has_account ? <LoginSection /> : <RegisterSection />;
  }
  if (loggedInUserEmail === partner_email) {
    return <AcceptSection />;
  }
}

function LogoutSection() {
  const {
    invitationData: { partner_email },
    loggedInUserEmail,
  } = Route.useRouteContext();
  const router = useRouter();
  return (
    <>
      <p>
        You are logged in as <strong>{loggedInUserEmail}</strong>. This
        invitation is for <strong>{partner_email}</strong>. Please log out and
        you'll be able to login or register with{" "}
        <strong>{partner_email}</strong>
      </p>
      <Button
        className="w-24"
        onClick={async () => {
          await supabase.auth.signOut();
          await router.invalidate();
        }}
      >
        Log out
      </Button>
    </>
  );
}

function AcceptSection() {
  const {
    invitationData: { partner_email },
    loggedInUserEmail,
  } = Route.useRouteContext();
  const acceptForm = useForm();
  const { code } = Route.useSearch();
  const router = useRouter();

  async function handleSubmit() {
    const { data: walletId, error } = await supabase.rpc("accept_invitation", {
      p_code: code,
    });
    if (error) {
      const message =
        ERROR_MESSAGES[error.code]?.({
          email: loggedInUserEmail ?? "",
          partnerEmail: partner_email,
        }) ?? DEFAULT_ERROR_MESSAGE;
      acceptForm.setError("root", { message });
      return;
    }

    if (walletId) {
      toast("Invitation accepted!");
      await router.navigate({
        to: "/dashboard/$walletId",
        params: { walletId: walletId },
      });
    }
  }

  const formRootError = acceptForm.formState.errors.root;

  return (
    <form onSubmit={acceptForm.handleSubmit(handleSubmit)} className="flex flex-col gap-3">
      <p>
        Your email <strong>{partner_email}</strong> has been verified. After you
        accept the invitation below, you'll both see and add transactions in one
        place.
      </p>
      <Button
        type="submit"
        className="w-24"
        disabled={acceptForm.formState.isSubmitting}
      >
        Accept
      </Button>
      {formRootError && <FieldError errors={[formRootError]} />}
    </form>
  );
}

function LoginSection() {
  return (
    <>
      You already have an account with us. Please log in and you can accept the
      invitation.
      <Button>Login</Button>
    </>
  );
}

function RegisterSection() {
  const {
    invitationData: { partner_email },
  } = Route.useRouteContext();
  const { code } = Route.useSearch();
  return (
    <>
      <p>
        Please create an account with this email:{" "}
        <strong>{partner_email}</strong> and you'll both see and add
        transactions in one place.
      </p>
      <Link
        className={`${buttonVariants()} w-40`}
        to="/register"
        search={{ code }}
      >
        Create Account
      </Link>
    </>
  );
}
