# 모바일 반응형 최적화 설계

**날짜:** 2026-03-10
**범위:** 프론트엔드 레이아웃 전반

---

## 배경

현재 레이아웃은 데스크톱 중심으로 설계되어 모바일(375px 기준)에서 다음 문제가 존재:
- 헤더가 화면 50% 이상 점유
- 네비게이션이 헤더 안에 있어 스크롤 후 접근 불가
- 복습 폼 textarea가 모바일에서 과도하게 큼
- sticky 액션 바 버튼이 모바일에서 줄바꿈될 수 있음
- 일부 정보가 `hidden sm:block`으로 모바일에서 숨겨짐

---

## 결정사항

| 항목 | 결정 |
|------|------|
| 모바일 네비게이션 | 하단 탭 바 (Bottom Tab Bar) |
| 복습 폼 레이아웃 | 세로 스크롤 유지, 여백/높이 최적화 |

---

## 변경 범위

### 1. `app-shell.tsx`

**모바일 (`< md`):**
- 헤더: 앱 이름 + "오늘 복습 시작" 버튼만 표시
- 큰 타이포그래피, 설명 문구, 배경 텍스트 "NOTE", nav 그리드 숨김
- `BottomTabBar` 컴포넌트 추가 — `fixed bottom-0 left-0 right-0`, `md:hidden`

**데스크톱 (`md+`):**
- 현재 레이아웃 그대로 유지

**`main` 패딩:**
- 모바일에서 하단 탭 바(64px) 높이만큼 `pb-20` 추가

### 2. `daily-review-form.tsx`

- textarea `min-h-52` → `min-h-32 sm:min-h-52`
- textarea `min-h-24` → `min-h-20 sm:min-h-24`
- sticky 액션 바: `flex-col sm:flex-row`, "AI 피드백 받기" 버튼 `w-full sm:w-auto`
- sticky 위치: `bottom-4` → `bottom-0 pb-safe` (iOS safe area 대응)

### 3. `dashboard-overview.tsx`

- `hidden sm:block` → `block` (연속 일수 모바일에서 표시)
- stat 카드 그리드: `sm:grid-cols-3` → `grid-cols-3` (모바일에서도 3단)

### 4. `review-feedback-panel.tsx`

- 다시 쓰기 textarea `min-h-44` → `min-h-28 sm:min-h-44`

### 5. `weekly-review-panel.tsx`

- 전략 textarea `min-h-28` → `min-h-20 sm:min-h-28`

### 6. `progress-overview.tsx`

- 스크롤 영역 `max-h-[600px]` → `max-h-[360px] sm:max-h-[600px]`

---

## 새 컴포넌트: `BottomTabBar`

```
위치: frontend/src/components/ui/bottom-tab-bar.tsx
```

- `"use client"` — `usePathname()` 사용
- 4개 탭: 대시보드(`/`), 오늘의 복습(`/review`), 이해도(`/progress`), 주간 회고(`/weekly`)
- 활성 탭: accent 색상 + 작은 점 인디케이터
- `md:hidden`으로 데스크톱에서 숨김
- `safe-area-inset-bottom` 대응

---

## 브레이크포인트 전략

| 범위 | 브레이크포인트 | 네비게이션 |
|------|--------------|----------|
| 모바일 | `< 768px (md)` | 하단 탭 바 |
| 태블릿/데스크톱 | `≥ 768px (md)` | 헤더 내 nav |

---

## 비변경 항목

- 전체 컬러 토큰 및 디자인 시스템
- 데스크톱 레이아웃 (현행 유지)
- 라우팅 구조
- 기능 로직
