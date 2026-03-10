"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

const tabs: Array<{ href: Route; label: string }> = [
  { href: "/", label: "대시보드" },
  { href: "/review", label: "오늘의 복습" },
  { href: "/progress", label: "이해도" },
  { href: "/weekly", label: "주간 회고" },
];

function isActive(href: Route, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div
        className="flex border-t border-black/10 bg-surface/95 backdrop-blur-sm"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {tabs.map((tab) => {
          const active = isActive(tab.href, pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-1 px-1 py-3 text-xs font-medium transition-colors ${
                active ? "text-accent-strong" : "text-ink-soft"
              }`}
            >
              <span
                className={`h-1 w-5 rounded-full transition-colors ${
                  active ? "bg-accent" : "bg-transparent"
                }`}
              />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
