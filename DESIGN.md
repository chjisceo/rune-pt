---
name: Rune-PT (룬PT)
description: 헬스장 한 손 세트 기록과 체격 보정 RPG 티어 상태창·근육 해부 시각화를 결합한 듀얼 테마 PT 워크스페이스 디자인 시스템
colors:
  bg: "#101826"
  bg-subtle: "#141f31"
  surface: "#182336"
  surface-elev: "#202e46"
  hud-bg: "#071020"
  hud-ink: "#eef5ff"
  hud-blue: "#63b3ff"
  hud-border: "rgba(99, 179, 255, 0.4)"
  border: "rgba(164, 194, 232, 0.2)"
  border-strong: "rgba(164, 194, 232, 0.36)"
  ink: "#f1f5fb"
  ink-secondary: "#c7d4e6"
  muted: "#98abc4"
  gold: "#eab354"
  gold-ink: "#121822"
  cyan: "#4ad4e6"
  cyan-soft: "rgba(74, 212, 230, 0.14)"
  ok: "#38c172"
  ok-soft: "rgba(56, 193, 114, 0.14)"
  warn: "#f06a54"
  warn-soft: "rgba(240, 106, 84, 0.14)"
  muscle-chest: "#f06a54"
  muscle-back: "#4ad4e6"
  muscle-leg: "#eab354"
  muscle-shoulder: "#a678f5"
  muscle-arm: "#38c172"
  muscle-core: "#ec5fa7"
  light-bg: "#f6f2e8"
  light-bg-subtle: "#ede6d6"
  light-surface: "#fffcf5"
  light-surface-elev: "#ffffff"
  light-hud-bg: "#081224"
  light-border: "#d8cfbc"
  light-border-strong: "#b9ad95"
  light-ink: "#18202c"
  light-ink-secondary: "#344154"
  light-muted: "#566376"
  light-gold: "#7d5710"
  light-gold-ink: "#fffcf5"
  light-cyan: "#0b7e93"
  light-cyan-soft: "rgba(11, 126, 147, 0.11)"
  light-ok: "#1d8048"
  light-ok-ink: "#ffffff"
  light-ok-soft: "rgba(29, 128, 72, 0.11)"
  light-warn: "#c8432f"
  light-warn-soft: "rgba(200, 67, 47, 0.11)"
  light-muscle-chest: "#d94c38"
  light-muscle-back: "#0b7e93"
  light-muscle-leg: "#7d5710"
  light-muscle-shoulder: "#6d4aff"
  light-muscle-arm: "#1d8048"
  light-muscle-core: "#c2367c"
  kakao-yellow: "#FEE500"
  kakao-ink: "#191919"
  tier-iron: "#7c8798"
  tier-bronze: "#b87349"
  tier-silver: "#9cb2c9"
  tier-gold: "#e2b659"
  tier-platinum: "#4ad4e6"
  tier-emerald: "#3bb56a"
  tier-diamond: "#5aa9ff"
  tier-master: "#a678f5"
  tier-grandmaster: "#f06a54"
  tier-challenger: "#ffd166"
typography:
  display:
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.33
    letterSpacing: "-0.025em"
  title:
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0em"
  body:
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.33
    letterSpacing: "0em"
  mono-num:
    fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0em"
    fontFeature: "tnum"
rounded:
  sm: "6px"
  md: "8px"
  elev: "10px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.gold-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-kakao:
    backgroundColor: "{colors.kakao-yellow}"
    textColor: "{colors.kakao-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
    height: "46px"
  button-secondary:
    backgroundColor: "{colors.surface-elev}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "40px"
  button-cyan-soft:
    backgroundColor: "{colors.cyan-soft}"
    textColor: "{colors.cyan}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "6px 10px"
  card-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
  card-elevated:
    backgroundColor: "{colors.surface-elev}"
    textColor: "{colors.ink}"
    rounded: "{rounded.elev}"
    padding: "14px"
  card-hud:
    backgroundColor: "{colors.hud-bg}"
    textColor: "{colors.hud-ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
  input-set:
    backgroundColor: "{colors.surface-elev}"
    textColor: "{colors.ink}"
    typography: "{typography.mono-num}"
    rounded: "{rounded.sm}"
    padding: "0 4px"
    height: "28px"
    width: "56px"
  input-field:
    backgroundColor: "{colors.surface-elev}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "10px 14px"
    height: "44px"
  nav-rail:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    padding: "20px 16px"
    width: "232px"
---

# Design System: Rune-PT (룬PT)

## Overview

**Creative North Star: "캘리브레이션 플레이트 & 상태창 HUD (The Calibration Plate & Status HUD)"**

Rune-PT(룬PT)는 헬스장 세트 간 `390px` 모바일 한 손 기록의 즉각성과 데스크톱 `1440px` 코칭·통계 분석의 밀도를 하나의 시각 언어로 통합합니다. 칙칙한 순흑(pure black)과 장식성 그라디언트 남발을 배제하고, 어두운 웨이트룸에서 선명하게 읽히는 **Luminous Slate Dark**(`data-theme="dark"`)와 밝은 조명·데스크톱 기록 시트에 어울리는 **Warm Parchment Light**(`data-theme="light"`)를 동등한 1급 테마로 제공합니다.

모든 화면은 세 가지 시각 계층으로 작동합니다. 먼저 작업 공간 바닥(`--bg`) 위에 얇은 `1px` 테두리로 구획된 기록 플레이트(`.surface-card` · `.surface-elev`)가 놓이고, 그 위에 **Calibrated Gold**(`--gold`) 단일 주행동과 **HUD Cyan**(`--cyan`) 상태·포커스 피드백이 얹힙니다. 마지막으로 우측 레일과 아바타 탭의 **Status HUD**(`.hud-panel`)가 코즈믹 네이비(`--hud-bg`)와 네온 블루(`--hud-blue`) 인셋 글로우로 RPG 티어·별·승급 경험치(MP) 정체성을 분리해 표현합니다.

**Key Characteristics:**
- **Bimodal First-Class Themes:** Luminous Slate Dark(선명한 네이비 슬레이트)와 Warm Parchment Light(따뜻한 양피지 시트) 모두 WCAG AA 대비 유지
- **Restrained Single-Gold Action:** 한 화면(viewport)에서 채워진 골드(`--gold`) 주행동 CTA는 최대 1개로 절제하고, 상태·포커스·필터는 `--cyan`으로 분리
- **HUD Isolation:** RPG 상태창(`.hud-panel`)은 다크/라이트 테마와 무관하게 깊은 코즈믹 네이비(`--hud-bg`)와 블루 인셋 글로우를 유지해 게이밍 정체성 보존
- **Tabular Precision & 1-Hand Ergonomics:** 모든 계측 수치에 `JetBrains Mono` + `tabular-nums`(`.mono-num`)를 강제하고, 모바일 주요 조작부에 `40px~46px` 터치 영역 확보

## Colors

팔레트는 `apps/web/src/styles/tokens.css`의 `:root` / `html[data-theme="dark"]` 및 `html[data-theme="light"]` CSS 커스텀 프로퍼티와 `packages/core/src/constants.ts`의 `TIER_COLORS`·`MUSCLE_META`를 단일 진실 원천으로 삼습니다.

### Primary
- **Calibrated Gold (`--gold` / `--gold-ink`):** 다크 모드에서는 발광 골드(`#eab354`, 텍스트 `#121822`), 라이트 모드에서는 브론즈 골드(`#7d5710`, 텍스트 `#fffcf5`)를 사용합니다. `오늘 운동 저장`, 선택된 운동 모드(`볼륨형` 등), 활성 웨이포인트 번호 배지, 미수령 선물 카운트 배지, 아바타 승급/희망 티어 강조에 쓰입니다.
- **Tactical Cyan (`--cyan` / `--cyan-soft`):** 다크 `#4ad4e6`(소프트 `rgba(74, 212, 230, 0.14)`), 라이트 `#0b7e93`(소프트 `rgba(11, 126, 147, 0.11)`)입니다. 키보드 포커스 링(`2px`), 활성 사이드바/하단 탭, `산책로 순서` 토글, `3D 근육 열기` 버튼, 실행 중인 휴식 타이머, 온보딩 진행 바를 담당합니다.

### Secondary
- **Cosmic HUD Blue (`--hud-blue` / `--hud-bg`):** 상태창 HUD 전용 보조 축입니다. 배경은 다크 `#071020` / 라이트 `#081224`, 본문 텍스트는 `#eef5ff`, 테두리는 `rgba(99, 179, 255, 0.4)`, 강조 블루는 `#63b3ff`를 사용합니다.
- **Semantic Status (`--ok` / `--warn`):** 저장 완료·세트 체크(`--ok`: 다크 `#38c172`, 라이트 `#1d8048`)와 실패·출석 주의·강도 `F` 세트 태그(`--warn`: 다크 `#f06a54`, 라이트 `#c8432f`)에 사용합니다. 각 소프트 배경(`--ok-soft`, `--warn-soft`)으로 행/배지 배경을 채웁니다.
- **6 Muscle-Plate Accents (`--chest`, `--back`, `--leg`, `--shoulder`, `--arm`, `--core`):** 2D/3D 해부 지도, 부위별 필터 필, 운동 카드 부위 배지에 사용합니다. CSS 변수 기준 다크 모드는 가슴 `#f06a54` · 등 `#4ad4e6` · 하체 `#eab354` · 어깨 `#a678f5` · 팔 `#38c172` · 코어 `#ec5fa7`이며, 라이트 모드는 가슴 `#d94c38` · 등 `#0b7e93` · 하체 `#7d5710` · 어깨 `#6d4aff` · 팔 `#1d8048` · 코어 `#c2367c`입니다. (`packages/core/src/constants.ts`의 `MUSCLE_META` JS 객체는 `leg.colorDark: #e2b659`, `arm.colorDark: #3bb56a`, `arm.colorLight: #228b4d`를 2D SVG 및 티어 뱃지 렌더링에 사용합니다.)
- **10 RPG Tier Colors (`TIER_COLORS`):** `아이언` `#7c8798`, `브론즈` `#b87349`, `실버` `#9cb2c9`, `골드` `#e2b659`, `플래티넘` `#4ad4e6`, `에메랄드` `#3bb56a`, `다이아몬드` `#5aa9ff`, `마스터` `#a678f5`, `그랜드마스터` `#f06a54`, `챌린저` `#ffd166`으로 고정됩니다.

### Neutral
- **Ground & Subtle (`--bg` / `--bg-subtle`):** 다크 `#101826` / `#141f31` (네이비 슬레이트 바탕), 라이트 `#f6f2e8` / `#ede6d6` (따뜻한 양피지 바탕).
- **Card & Elevated Surface (`--surface` / `--surface-elev`):** 다크 `#182336` / `#202e46`, 라이트 `#fffcf5` / `#ffffff`. 카드 내부 중첩 요소, 입력 필드, 미선택 버튼에 사용합니다.
- **Borders (`--border` / `--border-strong`):** 다크 `rgba(164, 194, 232, 0.2)` / `rgba(164, 194, 232, 0.36)`, 라이트 `#d8cfbc` / `#b9ad95`.
- **Typography Ink (`--ink` / `--ink-secondary` / `--muted`):** 다크 `#f1f5fb` / `#c7d4e6` / `#98abc4`, 라이트 `#18202c` / `#344154` / `#566376`.

### Named Rules
**The One-Gold-CTA Rule.** 뷰포트당 채워진 `--gold` 주행동 버튼은 최대 1개(예: `오늘 운동 저장`)만 허용합니다. 보조 버튼은 `--surface-elev` 또는 `--cyan-soft`를 사용해 시각적 경쟁을 차단합니다.

**The Kakao Isolation Rule.** 카카오 브랜드 노랑(`#FEE500`)과 텍스트(`#191919`)는 오직 로그인 화면의 `카카오로 계속하기` 버튼에만 사용합니다. 앱 내부 카드·배지·경고에 카카오 노랑을 쓰지 않습니다.

## Typography

**Display & Body Font:** `Noto Sans KR` (폴백: `-apple-system, BlinkMacSystemFont, sans-serif`)
**Label/Mono Font:** `JetBrains Mono` (폴백: `ui-monospace, SFMono-Regular, monospace`)

**Character:** 한글 가독성이 높은 `Noto Sans KR`로 코칭 안내와 운동명을 명확하게 전달하고, 모든 중량·횟수·볼륨·1RM·나이·체중·진행률·별 개수·MP 수치는 `.mono-num`(`font-variant-numeric: tabular-nums`)으로 정렬해 세트 행과 테이블 열이 흔들리지 않도록 고정합니다.

### Hierarchy
- **Display** (`800`, `2.25rem` / 모바일 `1.875rem`, `line-height: 1.25`, `tracking-tight`): 로그인 히어로 헤드라인에만 사용합니다.
- **Headline** (`700`, `1.5rem` / 모바일 `1.25rem`, `line-height: 1.33`, `tracking-tight`): 각 화면 최상단 `<h1>` 페이지 제목(`오늘의 운동 기록`, `트레이너 회원 관리 콘솔` 등)에 사용합니다.
- **Title** (`700`, `1rem`, `line-height: 1.5`): 운동 카드 제목, `.hud-panel` 티어 제목, 모달 헤더, 섹션 카드 제목에 사용합니다.
- **Body** (`400~500`, `0.875rem`, `line-height: 1.5`): 본문 설명, 코치 코멘트, 선물함 메시지, 네비게이션 메뉴 항목에 사용합니다.
- **Label** (`600~700`, `0.75rem` 또는 테이블 헤더 `11px`, `line-height: 1.33`): 세트 테이블 컬럼 헤더(`SET`, `이전 기록`, `KG`, `REPS`, `완료`), 필터 칩, 보조 메타 정보에 사용합니다.
- **Mono Numeral (`.mono-num`)** (`500~700`, `JetBrains Mono`, `tabular-nums`): `12px~24px` 범위에서 중량·반복 수·추정 1RM·타이머(`01:30`)·티어 MP·통계 수치에 필수 적용합니다.

### Named Rules
**The No-Eyebrow Rule.** `<h1>`~`<h3>` 제목 바로 위에 작은 eyebrow / kicker 라벨을 두지 않습니다. 제목 자체가 문맥을 즉시 설명합니다.

**The Tabular Numerals Rule.** 중량, 횟수, 볼륨, 1RM, 나이, 키, 체중, 진행률 `%`, 별 개수, 회원 수 등 모든 숫자에는 예외 없이 `.mono-num` 클래스를 적용합니다.

## Layout

모바일 헬스장 현장(`390px` 기준)과 데스크톱 코칭(`1440px` 기준, `lg: 1024px` 분기)을 하나의 반응형 셸(`App.tsx`)에서 수용합니다.

- **Desktop App Shell (`>= 1024px` / `lg`):** 좌측 `232px` 고정(`sticky top-0 h-screen`) 사이드바(`회원 뷰`/`트레이너` 역할 전환, 6개 회원 메뉴, 하단 자동 저장 상태 및 테마 토글) + 가변 중앙 `<main>` (`lg:px-7 lg:py-6 lg:pb-8`).
- **Today Workout Split (`WorkoutView`):** 중앙 유연 영역(`flex-1 min-w-0`)에 루틴 모드/`산책로 순서` 바 및 세트 테이블 카드를 배치하고, 우측 `368px` 고정 레일(`lg:sticky lg:top-6 lg:w-[368px]`)에 2D 해부 지도(`MuscleMap2D`)와 `StatusHudCard`를 세로 적층합니다.
- **12-Column Analytical & Console Grids:** 로그인 화면(`lg:grid-cols-12 gap-6 lg:gap-10`), 달력·통계(`lg:col-span-7` + `lg:col-span-5`, 통계 2열 `lg:col-span-6`), 트레이너 콘솔(`lg:col-span-5` 회원 목록 + `lg:col-span-7` 상세·선물 발송)은 12컬럼 그리드를 사용합니다.
- **Gym-Floor Mobile Shell (`< 1024px`):** 상단 고정(`sticky top-0 z-30`) 헤더(로고, 역할 전환 버튼 `min-h-[40px]`, 테마 전환 `40×40px`)와 하단 고정(`fixed bottom-0 z-30`) 5열 그리드 내비게이션(`min-h-[46px]`)을 배치하며, 본문 하단 패딩(`pb-24`)으로 가림을 방지합니다.
- **Set Table Grid:** `grid-cols-[36px_minmax(56px,1fr)_minmax(108px,1.25fr)_minmax(56px,0.75fr)_40px]`의 고정 비율 5열 테이블로 `390px` 화면에서도 가로 스크롤 없이 `SET / 이전 기록 / KG(-2.5/입력/+2.5) / REPS / 완료`가 한 줄에 들어옵니다.

## Elevation & Depth

Rune-PT는 그림자(Drop Shadow) 대신 **Surface Step + 1px Border(Tonal Layering)**를 기본 깊이 모델로 사용합니다.

- **Flat Tonal Stack:** `--bg` (바닥) → `.surface-card`(`--surface`, `1px solid var(--border)`) → `.surface-elev`(`--surface-elev`, `1px solid var(--border)`) 3단계 명도 차이로 위계를 만듭니다.
- **HUD Inset Glow:** `.hud-panel`만 예외적으로 `box-shadow: inset 0 0 28px rgba(99, 179, 255, 0.08)`과 `1px solid rgba(99, 179, 255, 0.4)`를 사용해 게임 상태창의 홀로그램 깊이를 부여합니다.
- **Overlay & Floating Exceptions:** 모달(`Muscle3DDialog`)은 `bg-black/65 backdrop-blur-xs` 배경 위에 `shadow-2xl`과 `modalIn`(`160ms ease-out`, `translateY(8px)` → `0`) 모션을 사용하며, 로그인 카드(`shadow-xl`)와 우측 하단 비차단 토스트(`shadow-lg`), 저장 버튼(`shadow-sm`)에만 외곽 그림자를 제한적으로 사용합니다.

### Named Rules
**The Flat-Plate-First Rule.** 일반 대시보드 카드와 세트 테이블 행은 정지 상태에서 drop-shadow를 쓰지 않고 `--surface` / `--surface-elev` 명도 차이와 `1px` 테두리로 구획합니다. 외곽 그림자는 모달·토스트·단독 인증 카드 등 부유 레이어에만 허용합니다.

## Shapes

기능적 계측 도구의 단정함과 모바일 터치 친화성을 결합한 절제된 직각 라운드 언어입니다.

- **Card Containers:** `.surface-card`와 `.hud-panel`은 `12px`(`border-radius: 12px`), 카드 내부 중첩 `.surface-elev` 컨테이너는 `10px`(`border-radius: 10px`)을 사용합니다.
- **Interactive Controls & Inputs:** 기본 버튼, 탭, 검색/필터 칩, 아이콘 박스, 사이드바 내비게이션 항목은 `8px`(`rounded-lg`), 로그인·온보딩 대형 입력 필드 및 OAuth CTA는 `12px`(`rounded-xl`), 세트 테이블 내부 인라인 숫자 입력과 `W/M/F` 태그·완료 체크 버튼은 `6px`(`rounded-md`)을 사용합니다.
- **Pills & Progress Indicators:** 휴식 타이머 캡슐, `산책로` 경유지 필, 근육 부위 배지, 선물 미확인 배지, XP/진행률 바는 `9999px`(`rounded-full`)을 사용합니다.

## Components

### Buttons
- **Shape:** 앱 내부 주행동/보조 버튼은 `8px`(`rounded-lg`), 로그인/온보딩 대형 CTA는 `12px`(`rounded-xl`), 휴식 타이머·웨이포인트는 `9999px`(`rounded-full`).
- **Primary (`오늘 운동 저장`):** `--gold` 배경, `--gold-ink` 텍스트, `px-4 py-2` (`8px 16px`), `text-sm font-bold`, `hover:opacity-90`.
- **Kakao OAuth (`카카오로 계속하기`):** `#FEE500` 배경, `#191919` 텍스트, `min-h-[46px] px-4 rounded-xl text-sm font-bold`.
- **Secondary / Ghost:** `--surface-elev` 배경, `1px solid var(--border)`(또는 `--border-strong`), `--ink` / `--ink-secondary` 텍스트, `min-h-[40px]` 이상. `+ 세트 추가`는 `border-dashed border-[var(--border-strong)]` 고스트 행입니다.
- **Focus:** `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cyan)]`.

### Chips
- **Set Type Tags (`W` / `M` / `F`):** `28×24px` (`w-7 h-6 rounded-md border mono-num text-xs font-bold`). 워밍업 `W`는 `--cyan` / `--cyan-soft`, 메인 `M`은 `--gold` / `rgba(234, 179, 84, 0.14)`, 실패지점 `F`는 `--warn` / `--warn-soft`.
- **Trail Waypoint & Muscle Filter Pills:** `산책로` 경유지는 `rounded-full px-2.5 py-1`, 선택 시 `border-[var(--gold)]`, 전체 완료 시 `bg-[var(--ok-soft)] border-[var(--ok)]`. `MuscleMap2D` 6대 근육 필터 버튼은 선택 시 해당 근육 토큰 색으로 채우고 흰색 텍스트(`#ffffff`)를 사용합니다.

### Cards / Containers
- **Surface Card (`.surface-card`):** `--surface` 배경, `1px solid var(--border)`, `12px` 라운드, `p-4` 또는 `p-5` 패딩. 선택된 운동 카드는 테두리를 `--gold`로 전환합니다.
- **Elevated Sub-Card (`.surface-elev`):** `--surface-elev` 배경, `1px solid var(--border)`, `10px` 라운드. 요약 타일과 1RM 배지에 사용합니다.
- **Status HUD Panel (`.hud-panel`):** `--hud-bg` 배경, `#eef5ff` 텍스트, `1px solid rgba(99, 179, 255, 0.4)`, `12px` 라운드, `inset 0 0 28px rgba(99, 179, 255, 0.08)` 글로우. 상단 티어/별(`★`), 3단 피라미드(`기반` `#63b3ff` / `고지` `#4ad4e6` / `정점` `#eab354`), 그라디언트 승급 경험치 바(`#63b3ff` → `#eab354`)를 포함합니다.

### Inputs / Fields
- **Set Numeric Input:** `h-10 sm:h-9 w-12 sm:w-14` (`40px` 모바일 / `36px` 데스크톱 높이), `rounded-md`, `--surface-elev` 배경, `1px solid var(--border)`, `.mono-num font-bold text-center`, `focus-visible:outline-2 focus-visible:outline-[var(--cyan)]`. 좌우 `-2.5` / `+2.5` 스텝퍼 버튼과 쌍으로 동작합니다.
- **Form & Search Input:** `min-h-[42px]~[44px]`, `rounded-xl`, `--surface-elev` 배경, `1px solid var(--border)`, `px-3.5`, `2px` `--cyan` 포커스 아웃라인.

### Navigation
- **Desktop Sidebar (`232px`):** `--surface` 배경, 우측 `1px solid var(--border)`. 역할 전환 세그먼트 컨트롤(`회원 뷰` `--gold` / `트레이너` `--cyan`), 활성 메뉴(`bg-[var(--cyan-soft)] border-[var(--cyan)]/40`), 선물함 미확인 골드 배지, 하단 동기화 상태(`Activity` + `--ok`)로 구성됩니다.
- **Mobile Top & Bottom Bar (`< 1024px`):** 상단 `sticky` 바와 하단 `fixed` 5열 탭(`min-h-[46px]`, 활성 탭 `--cyan` + `--cyan-soft`)으로 한 손 엄지 영역에 맞춥니다.

### 3D Muscle Viewer (`MuscleCanvas3D` + `Muscle3DDialog`)
- **인라인 3D 기본 뷰 & 모달 (`Muscle3DDialog`):** 우측 `오늘의 자극 부위` 카드는 무손실 Draco 경량 GLB(`4.97MB / 99만 삼각형`, 로컬 `/draco/` 디코더) 기반의 **`3D` 인라인 뷰를 기본 표시**(우측 상단 세그먼트로 `2D` 전환 가능)하며, 모바일 세로 스크롤 보호를 위해 인라인 드래그 회전은 기본 잠금(`360° 회전` 토글 + `전면 / 45° / 후면` 프리셋 제공)으로 둡니다. `큰 화면` 클릭 시 `bg-black/70 backdrop-blur-xs` 오버레이 + `.animate-modal-in`(`160ms ease-out`) + `.surface-card max-w-3xl` 모달이 열리며, 뷰어 하단에 `BodyParts3D © DBCLS (CC BY 4.0)` 출처와 비의료 참고용 문구(`SAFETY_ATTRIBUTION`)를 반드시 함께 노출합니다.

## Do's and Don'ts

### Do:
- **Do** 모든 수치(중량, 횟수, 볼륨, 1RM, 나이, 키, 체중, 진행률 `%`, 별, 회원 수)에 `.mono-num` 클래스를 적용하세요.
- **Do** 아이콘은 `lucide-react`만 사용하고, 다크(`data-theme="dark"`)와 라이트(`data-theme="light"`) 양쪽에서 `tokens.css` 변수를 통해 WCAG AA 대비를 유지하세요.
- **Do** 모바일 주요 버튼과 폼 입력의 터치 높이를 최소 `40px~44px` 이상으로 유지하고, 키보드 포커스 링(`2px` `--cyan`)을 생략하지 마세요.
- **Do** 3D 근육 뷰어는 로그인 화면에서 미리 fetch하지 않고 운동 화면/모달에서 온디맨드 로드(`4.97MB` 무손실 Draco + `/draco/`)하며, `BodyParts3D © DBCLS (CC BY 4.0)` 및 비의료 고지를 함께 표시하세요.

### Don't:
- **Don't** 카카오 노랑(`#FEE500`)과 텍스트(`#191919`)를 `카카오로 계속하기` 버튼 외의 다른 버튼, 배지, 카드에 사용하지 마세요.
- **Don't** `<h1>`~`<h3>` 제목 바로 위에 작은 eyebrow / kicker 라벨을 추가하지 마세요.
- **Don't** JSX 안에 이모지 아이콘을 넣거나, 3D/아바타 뷰어 및 `postMessage`로 회원 PII(성별, 나이, 키, 체중, 체지방률, 부상 메모)를 전송하지 마세요.
- **Don't** 한 뷰포트에 채워진 `--gold` 프라이머리 CTA를 2개 이상 두거나, 일반 카드에 무거운 drop-shadow를 남발하지 마세요.
