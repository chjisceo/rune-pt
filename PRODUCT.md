# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

`packages/core` (shared TypeScript domain logic for tier/1RM/volume calculations, exercise catalog, and Supabase adapter) + `apps/web` (`Vite + React + TypeScript + Tailwind CSS + shadcn/ui`). Designed so a future `apps/mobile` (`Expo` / React Native + `NativeWind` / `React Native Reusables`) can reuse `packages/core`, Supabase auth/sync, and design tokens without rebuilding product logic.

## Users

1. **Primary — Gym Members (PT 회원 및 개인 웨이트 트레이닝 이용자):** Train on smartphones at the gym (often one-handed between sets under variable gym lighting) and review routines, stats, and tier progress on desktop or mobile web.
2. **Secondary — Personal Trainers (트레이너 / 코치):** Manage member schedules, assign routine gifts (`선물함`), conduct live lesson logs (`수업 룬 페이지`), and verify tier promotion exams on desktop web.

## Product Purpose

Help gym members log workouts quickly, understand which muscles each exercise trains via 3D anatomy inspection, and stay motivated through body-calibrated RPG tier progression (`아이언` → `챌린저`, 1–5★) and an interactive status-window avatar—while connecting trainers and members through shared routines and coaching verification.

## Positioning

Uniquely combines three mechanisms in one Korean PT product:
1. **Body-Calibrated RPG Tier & Star Progression:** 10 tiers (`아이언` to `챌린저`) and 5 stars per tier scaled to user age, sex, height, weight, and body-fat percentage, with promotion exams and trainer confirmation.
2. **Interactive Status Avatar (`avatar.html`):** Wireframe/3D character status window displaying part-by-part tier illumination, equippable tier gear (`NEW` unlocks), and a 3-stage percentile pyramid.
3. **Exercise-Linked Muscle & Route Intelligence:** Today's workout modes (`볼륨형`, `스트렝스 강화형`, `로우컨디션형`), exercise sequence trail (`산책로` / `라인업`), and on-demand 3D anatomical muscle/skeleton inspection (`BodyParts3D`).

## Operating Context

- **Gym Floor (Mobile, 390px):** Entered via Kakao/Google login (including KakaoTalk in-app browser redirect guidance), quick set logging between sets with minimal taps, previous-session weight/rep reference, rest/sync feedback (`저장됨` / `저장 중` / `저장 실패`), and instant muscle confirmation.
- **Desktop Review & Coaching (1440px):** Routine planning, calendar/30-day radar & tier mastery analysis, avatar status inspection, and trainer class/member/gift administration.
- **Offline-Resilient Sync:** Drafts persist locally (`rpt1`) and sync to Supabase (`@supabase/supabase-js`) when online.

## Capabilities and Constraints

- **Core Member Flows:** Login/auto-signup (Kakao, Google), 6-step profile onboarding (age 8–90, sex, height 120–230cm, weight 25–250kg, optional body-fat 3–60%, experience, interests, injuries), Today's Workout (3 modes, exercise list/trail, set weight/reps/type `W`/`M`/`F` logging, completed volume vs planned volume), Muscle 3D Viewer modal, Avatar Status Window & Gear Equipment, Calendar history, Statistics (30-day 6-axis radar, frequent exercises, tier progression), Account/Body measurement log, 5km Running log (unlocks shoe tier), and Routine Gift Box (`선물함`).
- **Core Trainer Flows (Admin Mode):** Calendar, daily class schedule, quests/notes, member management & promotion approval, custom exercise catalog, sending routine gifts.
- **Security & Privacy Constraints (Binding):**
  - Keep only publishable client key; never embed `sb_secret` or `service_role`.
  - Keep fixed `APP_URL` OAuth `redirectTo`; keep `history.replaceState` cleanup for `code`/`access_token`.
  - Sanitize all member/trainer strings with escaping; never pass PII (sex, age, height, weight, body fat, injury notes) to external CDNs or 3D/avatar viewers via `postMessage` or analytics; lock `postMessage` `targetOrigin` to `location.origin` and verify `event.origin` + `event.source`.
  - Do not lower onboarding minimum age (8–90) or expand under-14 data collection.
- **3D Asset Performance & Attribution Constraints (Binding):**
  - `stayfit-muscle-skeleton.glb` uses lossless Draco compression (`4.97MB`, ~990k triangles, all FMA mesh names preserved) served with a local `/draco/` WASM decoder; never embed it as base64 or prefetch on login screens, load only when the 3D anatomy view (`WorkoutView` default 3D panel or modal) mounts, keep a `2D` SVG fallback and mobile scroll-safe drag lock, and support `kakaotalk://web/openExternal?url=...` external browser handoff inside KakaoTalk in-app webviews.
  - Required BodyParts3D attribution and non-medical educational disclaimer inside the muscle viewer (`BodyParts3D © The Database Center for Life Science, CC BY 4.0`).
  - Remove developer/deploy troubleshooting copy (e.g. checking whether the `avatar` folder exists).
- **Confirmed Product Assumptions / Open Decisions (inferred from current codebase & review, adjustable during design):**
  - *Assumption 1 (Scope):* Include member core flows plus avatar status, calendar/stats, and trainer/gift touchpoints in the unified system architecture.
  - *Assumption 2 (Today Workflow):* Prioritize scannable set-logging table (with previous record & W/F/done controls) and linked muscle map on the Today surface, keeping the `산책로` route visualization accessible as a switchable view/toggle rather than forcing polygon-node tapping for every set.

## Brand Commitments

- **Name:** `룬PT` (Rune-PT)
- **Voice & Copy:** Korean polite informal (`해요체`), encouraging yet practical coaching tone, no medical/diagnostic claims, and unified navigation labels (`오늘`, `달력`, `통계`, `내 정보`).
- **Existing Assets:**
  - Live app source (`https://upvible.github.io/Rune-PT/` — `index.html`, `avatar/avatar.html`)
  - `StayFit-muscle-3D` (`/Users/harry/Downloads/StayFit-muscle-3D/stayfit-muscle-skeleton.glb`, `ATTRIBUTION.md`)

## Evidence on Hand

- Live `Rune-PT` production code (`index.html`, `avatar/avatar.html`)
- Current screenshots in `/Volumes/SSD980/code/rune-pt/design-review/current/` (`login-desktop-dark.png`, `login-desktop-light.png`, `login-mobile-dark.png`)
- Prior Grok design review in `/Volumes/SSD980/code/rune-pt/design-review/개선-프롬프트.md` and `/Volumes/SSD980/code/rune-pt/design-review/mock/index.html`
- Reference benchmarks inspected directly: Hevy (`hevyapp.com`), Hevy Coach (`hevycoach.com`), Planfit (`planfit.ai`), MuscleWiki (`musclewiki.com`), shadcn/ui (`ui.shadcn.com`)
- **Absences (do not fabricate):** Real user analytics, testimonials, App Store ratings, or live authenticated member workout logs (mockups must label synthetic example data clearly or keep realistic representative states without inventing fake customer claims).

## Product Principles

1. **Visibility of State & Place:** Current tab, server sync status (`저장됨`/`저장 중`/`저장 실패`), active exercise, and tier progress are always clear at a glance.
2. **Gym-Floor Ergonomics First:** Logging a set with previous-session context takes minimal taps in the thumb zone, without modal friction.
3. **Earnable Mastery & Restraint:** RPG tier/rune identity motivates progression without cluttering daily workout execution; at most one primary filled CTA per viewport, with Kakao yellow reserved strictly for Kakao login.
4. **Anatomy Connected to Movement:** Target and secondary muscles sit alongside the active exercise and open an interactive 3D inspector only on demand.
5. **Bimodal Clarity (Light & Dark):** Both light and dark themes remain first-class citizens for bright gyms, dim weight rooms, and desktop planning.

## Accessibility & Inclusion

- WCAG AA contrast (≥4.5:1 body/secondary text, ≥3:1 large text/UI controls) in both light and dark themes.
- Minimum 40px–44px touch targets for gym-floor mobile actions and visible 2px keyboard focus rings for desktop use.
- Tabular numerals (`tabular-nums`) for weights, reps, volumes, and timers.
