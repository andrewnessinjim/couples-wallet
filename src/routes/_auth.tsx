import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted p-4">
      <div className="w-full max-w-sm flex flex-col gap-2">
        <Link to="/" className="text-lg font-semibold self-start">
          💰 Couples Wallet
        </Link>
        <Outlet />
      </div>
    </main>
  );
}
