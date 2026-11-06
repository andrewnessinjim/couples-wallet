import { Container } from "@/components/Container";
import { buttonVariants } from "@/components/ui/button";
import { Alert02Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/invalid-invitation")({
  component: InvalidInvitation,
});

function InvalidInvitation() {
  return (
    <main className="py-8">
      <Container>
        <div className="max-w-md mx-auto">
          <HugeiconsIcon
            icon={Alert02Icon}
            className="size-10 text-destructive mb-4"
          />

          <h1 className="text-3xl font-medium mb-4">Invalid Invitation</h1>
          <p>
            This invitation is invalid. Please ask your partner to resend the
            invitation URL. You can also log in or create a new account if your
            partner doesn't have an account.
          </p>
          <Link
            className={`${buttonVariants({ variant: "link" })} p-0! mt-4 text-link`}
            to="/"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              data-icon="inline-start"
              className="size-6"
            />
            Home
          </Link>
        </div>
      </Container>
    </main>
  );
}
