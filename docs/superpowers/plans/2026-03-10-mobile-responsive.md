# 모바일 반응형 최적화 구현 계획

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모바일(375px~)에서 하단 탭 바 네비게이션 추가 및 폼/콘텐츠 레이아웃 최적화

**Architecture:** 모바일에서 `app-shell.tsx`의 헤더를 slim하게 축소하고 새 `BottomTabBar` 컴포넌트를 `md:hidden`으로 고정 배치. 각 페이지 컴포넌트는 Tailwind 반응형 클래스 수정만으로 최적화.

**Tech Stack:** Next.js App Router, Tailwind CSS, React (`usePathname`)

---

## 파일 구조

| 파일 | 변경 유형 | 책임 |
|------|---------|------|
| `frontend/src/components/ui/bottom-tab-bar.tsx` | **신규 생성** | 모바일 전용 하단 탭 바 |
| `frontend/src/components/ui/app-shell.tsx` | 수정 | 모바일 헤더 slim화, BottomTabBar 추가 |
| `frontend/src/components/review/daily-review-form.tsx` | 수정 | textarea 높이, 액션 바 버튼 레이아웃 |
| `frontend/src/components/review/review-feedback-panel.tsx` | 수정 | textarea 높이 |
| `frontend/src/components/dashboard/dashboard-overview.tsx` | 수정 | 연속 일수 표시, stat 카드 그리드 |
| `frontend/src/components/weekly/weekly-review-panel.tsx` | 수정 | textarea 높이 |
| `frontend/src/components/progress/progress-overview.tsx` | 수정 | 스크롤 영역 높이 |

> **참고:** 이 프로젝트에 UI 컴포넌트 테스트 파일이 없으므로 테스트 단계는 브라우저 시각 확인으로 대체.

---

## Chunk 1: BottomTabBar 컴포넌트 + AppShell 수정

### Task 1: `BottomTabBar` 컴포넌트 생성

**Files:**
- Create: `frontend/src/components/ui/bottom-tab-bar.tsx`

- [ ] **Step 1: 파일 생성**

탭 레이블은 `app-shell.tsx`의 `navItems`와 동일하게 통일. iOS safe area 대응을 위해 inner div에 `pb-safe` 추가 (Tailwind의 `env(safe-area-inset-bottom)` 대응).

```tsx
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
```

- [ ] **Step 2: 브라우저에서 확인 (`npm run dev` 실행 중이어야 함)**

모바일 뷰(375px)로 개발자 도구 전환 후 화면 하단에 4개 탭이 표시되는지 확인.
활성 탭에 accent 색상 + 상단 인디케이터 점이 보이는지 확인.

---

### Task 2: `app-shell.tsx` — 모바일 헤더 slim화 + BottomTabBar 주입

**Files:**
- Modify: `frontend/src/components/ui/app-shell.tsx`

현재 파일 전체 내용:
```
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import type { PropsWithChildren } from "react";
// ... (헤더에 큰 타이포, 설명, nav 그리드 포함)
```

- [ ] **Step 1: `BottomTabBar` import 추가 및 모바일 헤더 분기 처리**

**변경 요점:**
- `py-6 sm:py-8` → `py-4 sm:py-6` (모바일 헤더 높이 줄이기, 데스크톱도 `sm:py-6`으로 소폭 압축)
- 배경 텍스트 "NOTE": 기존에는 모바일에도 표시됐으나 `sm:flex`로 데스크톱 전용으로 변경 (의도적)
- nav가 기존 `sm:grid-cols-4`(640px+)에서 `md:grid`(768px+)로 변경됨 — 태블릿 768px 미만에서는 BottomTabBar로 대체

`app-shell.tsx` 전체를 다음으로 교체:

```tsx
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
```

- [ ] **Step 2: 브라우저 확인**

- 모바일(375px): 헤더에 "ReflectNote" + "오늘 복습 시작" 버튼만 표시, BottomTabBar 4탭이 하단에 고정되는지 확인
- 데스크톱(1280px): 풀 헤더 + nav 그리드 표시, BottomTabBar가 보이지 않는지 확인
- 모바일에서 콘텐츠 마지막 줄이 BottomTabBar에 가려지지 않는지 확인 (`pb-24`)

  실패 시: 빌드 캐시 제거 후 재시작 (`rm -rf frontend/.next && npm run dev`). TypeScript 에러 발생 시 `Route` import 또는 `BottomTabBar` export 이름 확인.

- [ ] **Step 3: 커밋**

```bash
git add frontend/src/components/ui/bottom-tab-bar.tsx frontend/src/components/ui/app-shell.tsx
git commit -m "feat: add mobile bottom tab bar and slim header"
```

---

## Chunk 2: 폼·콘텐츠 컴포넌트 모바일 최적화

### Task 3: `daily-review-form.tsx` — textarea 높이 + 액션 바 최적화

**Files:**
- Modify: `frontend/src/components/review/daily-review-form.tsx`

- [ ] **Step 1: 설명 textarea 높이 조정 (라인 314)**

```
변경 전: className="min-h-52 rounded-3xl ..."
변경 후: className="min-h-32 sm:min-h-52 rounded-3xl ..."
```

- [ ] **Step 2: 질문 textarea 높이 조정 (라인 347)**

```
변경 전: className="mt-4 min-h-24 rounded-2xl ..."
변경 후: className="mt-4 min-h-20 sm:min-h-24 rounded-2xl ..."
```

- [ ] **Step 3: 틀린 이유 textarea 높이 조정 (라인 404)**

```
변경 전: className="mt-3 min-h-20 w-full ..."
변경 후: className="mt-3 min-h-16 sm:min-h-20 w-full ..."
```

- [ ] **Step 4: sticky 액션 바 레이아웃 최적화 (라인 439)**

```
변경 전:
<div className="sticky bottom-4 z-10 flex flex-wrap gap-3 rounded-3xl border border-black/10 bg-surface/95 p-3 shadow-strong backdrop-blur">
  <Button disabled={isSaving || isEvaluating} onClick={handleSaveDraft} type="button">
    {isSaving ? "저장 중..." : "임시 저장"}
  </Button>
  <Button disabled={isSaving || isEvaluating} onClick={handleEvaluate} tone="secondary" type="button">
    {isEvaluating ? "피드백 불러오는 중..." : "AI 피드백 받기"}
  </Button>
</div>

변경 후:
<div className="sticky bottom-0 z-10 flex flex-col gap-2 rounded-t-3xl border border-black/10 bg-surface/95 p-3 shadow-strong backdrop-blur sm:flex-row sm:rounded-3xl sm:gap-3 sm:bottom-4">
  <Button disabled={isSaving || isEvaluating} onClick={handleSaveDraft} type="button" className="w-full sm:w-auto">
    {isSaving ? "저장 중..." : "임시 저장"}
  </Button>
  <Button disabled={isSaving || isEvaluating} onClick={handleEvaluate} tone="secondary" type="button" className="w-full sm:w-auto">
    {isEvaluating ? "피드백 불러오는 중..." : "AI 피드백 받기"}
  </Button>
</div>
```

> **주의:** `Button` 컴포넌트가 `className` prop을 받지 않는다면 Step 4 전에 확인 후 `className` prop 지원 추가 필요.

- [ ] **Step 5: `Button` 컴포넌트 `className` prop 지원 확인**

`frontend/src/components/ui/button.tsx` 읽어서 `className` prop을 merge하는지 확인.
지원하지 않으면 다음을 추가:
```tsx
// button.tsx — props에 className?: string 추가 후
className={cn(baseStyles, toneStyles[tone], className)}
```

- [ ] **Step 6: 브라우저 확인**

- 모바일(375px): 버튼 2개가 세로로 쌓이고 전체 너비를 차지하는지 확인
- 데스크톱(1280px): 버튼이 가로로 배치되는지 확인

- [ ] **Step 7: 커밋**

```bash
git add frontend/src/components/review/daily-review-form.tsx frontend/src/components/ui/button.tsx
git commit -m "feat: optimize daily review form for mobile"
```

---

### Task 4: `review-feedback-panel.tsx` — textarea 높이

**Files:**
- Modify: `frontend/src/components/review/review-feedback-panel.tsx`

- [ ] **Step 1: 다시 쓰기 textarea 높이 조정 (라인 114)**

```
변경 전: className="mt-4 min-h-44 w-full ..."
변경 후: className="mt-4 min-h-28 sm:min-h-44 w-full ..."
```

- [ ] **Step 2: 커밋**

```bash
git add frontend/src/components/review/review-feedback-panel.tsx
git commit -m "feat: reduce feedback textarea height on mobile"
```

---

### Task 5: `dashboard-overview.tsx` — 연속 일수 표시 + stat 그리드

**Files:**
- Modify: `frontend/src/components/dashboard/dashboard-overview.tsx`

- [ ] **Step 1: 연속 일수 StatusPill 모바일 표시 (라인 38)**

```
변경 전: <div className="shrink-0 hidden sm:block">
변경 후: <div className="shrink-0">
```

- [ ] **Step 2: stat 카드 그리드 — 모바일에서도 3단 (라인 53)**

현재 `sm:grid-cols-3 lg:grid-cols-1`은 모바일(xs)에서 1단. 3개 StatCard를 모바일에서도 3단으로.

```
변경 전: className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1"
변경 후: className="grid grid-cols-3 gap-3 lg:grid-cols-1"
```

- [ ] **Step 3: 브라우저 확인**

- 모바일(375px): "N일 연속" 뱃지가 오른쪽 상단에 표시되는지 확인
- stat 카드 3개가 한 행에 작게 표시되는지 확인 (텍스트 잘림 없는지)

- [ ] **Step 4: 커밋**

```bash
git add frontend/src/components/dashboard/dashboard-overview.tsx
git commit -m "feat: show streak on mobile and fix stat grid"
```

---

### Task 6: `weekly-review-panel.tsx` — textarea 높이

**Files:**
- Modify: `frontend/src/components/weekly/weekly-review-panel.tsx`

- [ ] **Step 1: 전략 textarea 높이 조정 (라인 179)**

```
변경 전: className="min-h-28 rounded-2xl ..."
변경 후: className="min-h-20 sm:min-h-28 rounded-2xl ..."
```

- [ ] **Step 2: 커밋**

```bash
git add frontend/src/components/weekly/weekly-review-panel.tsx
git commit -m "feat: reduce weekly review textarea height on mobile"
```

---

### Task 7: `progress-overview.tsx` — 스크롤 영역 높이

**Files:**
- Modify: `frontend/src/components/progress/progress-overview.tsx`

- [ ] **Step 1: 이해도 변화 스크롤 영역 높이 (라인 39)**

```
변경 전: className="grid gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"
변경 후: className="grid gap-4 max-h-[360px] sm:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"
```

- [ ] **Step 2: 개념 mastery 스크롤 영역 높이 (라인 64)**

```
변경 전: className="grid gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"
변경 후: className="grid gap-3 max-h-[360px] sm:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"
```

- [ ] **Step 3: 커밋**

```bash
git add frontend/src/components/progress/progress-overview.tsx
git commit -m "feat: reduce progress scroll area height on mobile"
```

---

## 최종 확인

- [ ] 모든 4개 페이지(대시보드, 복습, 이해도, 주간 회고)를 모바일 375px에서 확인
- [ ] 데스크톱 1280px에서 기존 레이아웃이 깨지지 않는지 확인
- [ ] 하단 탭 바 활성 상태가 각 페이지 전환 시 올바르게 변경되는지 확인
- [ ] 복습 폼 sticky 버튼이 키보드 올라왔을 때 콘텐츠를 가리지 않는지 확인 (iOS Safari)
