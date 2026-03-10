import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import "@/styles/globals.css";

import { AppShell } from "@/components/ui/app-shell";

export const metadata: Metadata = {
  title: "리플렉트노트",
  description: "개념 이해를 짧게 설명하고 피드백으로 다시 다듬는 학습 저널",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
