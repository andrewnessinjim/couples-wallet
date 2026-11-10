import type { ReactNode } from "react";
import { Container } from "./Container";
import { Link } from "@tanstack/react-router";

interface Props {
  children?: ReactNode;
  walletName?: string;
  ownerName?: string | null;
  partnerName?: string | null;
}

function CoupleInitials({
  ownerName,
  partnerName,
}: Pick<Props, "ownerName" | "partnerName">) {
  if (ownerName && partnerName) {
    return (
      <div className="ms-1 text-xs font-extrabold bg-primary-200 p-0.75 rounded-md">
        {ownerName[0]}♡{partnerName[0]}
      </div>
    );
  }
  return null;
}

export function Header({
  children,
  walletName,
  ownerName,
  partnerName,
}: Props) {
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
            <CoupleInitials ownerName={ownerName} partnerName={partnerName} />
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
