import { cn } from "@/lib/utils";
import type React from "react";

export function Container({
  className,
  ...delegated
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("px-4 mx-auto max-w-5xl", className)} {...delegated} />
  );
}
