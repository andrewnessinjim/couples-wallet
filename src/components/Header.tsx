import type { ReactNode } from "react";
import { Container } from "./Container";
import { Link } from "@tanstack/react-router";

interface Props {
  children: ReactNode;
}
export function Header({ children }: Props) {
  return (
    <header className="border-b">
      <Container className="flex h-16  items-center justify-between">
        <Link to="/" className="text-lg font-semibold">
          💰 Couples Wallet
        </Link>
        <nav className="flex items-center gap-2">{children}</nav>
      </Container>
    </header>
  );
}
