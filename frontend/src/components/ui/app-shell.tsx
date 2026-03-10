"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import type { PropsWithChildren } from "react";

import { BottomTabBar } from "@/components/ui/bottom-tab-bar";

const navItems: Array<{ href: Route; label: string; helper: string }> = [
  { href: "/", label: "대시보드", helper: "오늘의 흐름" },
  { href: "/review", label: "오늘의 복습", helper: "5분 루프" },
  { href: "/progress", label: "이해도", helper: "설명 변화" },
  { href: "/weekly", label: "주간 회고", helper: "패턴 정리" },
];

function isActive(href: Route, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface-dark px-5 py-4 text-white shadow-strong sm:px-8 sm:py-6">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />

        {/* 배경 텍스트 — 데스크톱만 */}
        <div className="pointer-events-none absolute inset-x-0 top-10 hidden justify-center text-[10rem] font-black leading-none tracking-tight text-white/5 sm:flex">
          NOTE
        </div>

        <div className="relative z-10 flex flex-col gap-4 sm:gap-6">

          {/* 모바일: 앱 이름 + CTA 버튼만 */}
          <div className="flex items-center justify-between gap-4 md:hidden">
            <span className="text-base font-bold tracking-tight text-white">ReflectNote</span>
            <Link
              className="inline-flex shrink-0 items-center rounded-2xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-darker shadow-soft transition hover:scale-105"
              href="/review"
            >
              오늘 복습 시작
            </Link>
          </div>

          {/* 데스크톱: 풀 헤더 */}
          <div className="hidden md:flex items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-6 text-xs font-semibold uppercase tracking-widest text-white/90">
                <span>ReflectNote MVP</span>
                <span>Track understanding</span>
              </div>
              <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                오늘 배운 개념을
                <br className="hidden sm:block" />
                더 쉽게 다시 설명해요.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
                공부 시간을 재는 대신, 내가 이해한 개념을 짧게 설명하고 피드백을 받아 다시 다듬는 학습 루프에 집중합니다.
              </p>
            </div>
            <Link
              className="inline-flex shrink-0 items-center rounded-2xl bg-accent px-5 py-3.5 text-sm font-semibold text-accent-darker shadow-soft transition hover:scale-105"
              href="/review"
            >
              오늘 복습 시작
            </Link>
          </div>

          {/* 네비게이션 — 데스크톱만 */}
          <nav className="hidden grid-cols-4 gap-2 md:grid">
            {navItems.map((item) => {
              const active = isActive(item.href, pathname);
              return (
                <Link
                  key={`${item.label}-${item.href}`}
                  className={`rounded-3xl border px-4 py-3 backdrop-blur transition ${
                    active
                      ? "border-accent/50 bg-accent/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                  href={item.href}
                >
                  <p className={`text-sm font-semibold tracking-tight ${active ? "text-accent" : "text-white"}`}>
                    {item.label}
                  </p>
                  <p className={`mt-1 text-xs ${active ? "text-accent/70" : "text-white/50"}`}>
                    {item.helper}
                  </p>
                </Link>
              );
            })}
          </nav>

        </div>
      </header>

      {/* pb-24(96px): BottomTabBar 높이(~56px) + safe-area 여유분. spec의 pb-20보다 크게 잡아 iOS 노치 기기에서 콘텐츠가 잘리지 않도록 함.
          md:pb-10: 데스크톱에서는 BottomTabBar 없으므로 기존 수준 패딩 유지. */}
      <main className="relative z-10 -mt-4 rounded-t-[32px] bg-background px-4 pt-10 pb-24 sm:px-6 md:pb-10">
        {children}
      </main>

      <BottomTabBar />
    </div>
  );
}
