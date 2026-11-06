import { Container } from "@/components/Container";
import { createFileRoute } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { MailSend01Icon } from "@hugeicons/core-free-icons";

export const Route = createFileRoute("/_public/email-confirmation")({
  staticData: {hideAuthLinks: true},
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="py-8">
      <Container>
        <div className="max-w-md mx-auto flex flex-col gap-3">
          <div className="flex justify-center">
            <HugeiconsIcon
              icon={MailSend01Icon}
              className="size-12 text-primary-300"
            />
          </div>
          <h1 className="text-3xl font-bold">Check your inbox</h1>
          <p>
            We sent you an email with a confirmation link. Click it to finish
            creating your account, and your shared wallet will be ready.
          </p>
          <p>Can't find it? Check your spam folder.</p>
        </div>
      </Container>
    </main>
  );
}
