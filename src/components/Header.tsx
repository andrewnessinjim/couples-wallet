import type { ReactNode } from "react";
import { Container } from "./Container";
import { Link } from "@tanstack/react-router";

interface Props {
  children?: ReactNode;
  walletName?: string;
}
export function Header({ children, walletName }: Props) {
  return (
    <header className="border-b">
      <Container className="flex h-16  items-center justify-between">
        {walletName ? (
          <div className="flex items-baseline gap-1">
            <Link to="/" className="text-lg">
              💰
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-lg font-medium ">{walletName}</h1>
          </div>
        ) : (
          <Link to="/" className="text-lg">
            💰 Couples Wallet
          </Link>
        )}
        <nav className="flex items-center gap-2">{children}</nav>
      </Container>
    </header>
  );
}
