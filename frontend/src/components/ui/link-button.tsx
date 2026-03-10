import Link from "next/link";
import type { Route } from "next";
import type { PropsWithChildren } from "react";

type LinkButtonProps = PropsWithChildren<{
  href: Route;
  className?: string;
  tone?: "primary" | "secondary";
}>;

const toneClasses: Record<NonNullable<LinkButtonProps["tone"]>, string> = {
  primary: "bg-surface-dark text-white shadow-md hover:shadow-lg",
  secondary: "border border-black/10 bg-surface-muted text-ink hover:bg-black/5",
};

export function LinkButton({ children, className = "", href, tone = "primary" }: LinkButtonProps) {
  return (
    <Link
      className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition duration-200 hover:translate-y-[-1px] ${toneClasses[tone]} ${className}`.trim()}
      href={href}
    >
      {children}
    </Link>
  );
}
