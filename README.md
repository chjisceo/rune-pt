# Rune-PT (룬PT) 유지보수 가이드

이 문서는 처음 코드를 열어보는 분도 **"어디를 고치면 어디가 바뀌는지"** 바로 찾을 수 있도록 정리한 안내서입니다.

---

## 1. 자주 수정하는 5곳 (빠른 찾기)

| 바꾸고 싶은 것 | 수정할 파일 | 설명 |
|---|---|---|
| **로고 / 앱 이름 / 파비콘** | [`apps/web/src/components/BrandLogo.tsx`](./apps/web/src/components/BrandLogo.tsx)<br>[`apps/web/public/favicon.svg`](./apps/web/public/favicon.svg) | 사이드바·모바일 상단·로그인 헤더 로고가 모두 `BrandLogo` 한 곳을 봅니다. 방패 아이콘 대신 `<img src="/logo.svg" />`만 넣으면 전체 화면이 한 번에 바뀝니다. |
| **테마·HUD·3D 색상** | [`apps/web/src/styles/tokens.css`](./apps/web/src/styles/tokens.css) | 다크/라이트 배경색, 포인트 색(`--cyan`, `--gold`), RPG 상태창(`--hud-*`), 3D 캔버스 배경/근육 색(`--canvas-*`)이 모두 CSS 변수 한 파일에 모여 있습니다. |
| **데이터 저장 방식 (로컬 ↔ Supabase)** | [`packages/core/src/repository.ts`](./packages/core/src/repository.ts)<br>[`apps/web/src/services/localRuneRepository.ts`](./apps/web/src/services/localRuneRepository.ts) | 현재는 브라우저 `localStorage('rpt1')`에 자동 저장됩니다. 추후 Supabase를 붙일 때는 `RuneDataRepository` 인터페이스를 구현한 새 파일을 만들고 `runeRepository` 한 줄만 교체하면 됩니다. |
| **티어 계산 / 부위 목록 / 안전 나이 규칙** | [`packages/core/src/`](./packages/core/src/) | `tierCore.ts`(1RM·볼륨·나이 보정), `constants.ts`(티어·부위 메타), `types.ts`(데이터 타입)에 순수 TypeScript로 분리되어 있어 웹·모바일 앱이 함께 재사용합니다. |
| **초기 데모 운동·회원 데이터** | [`packages/core/src/sampleData.ts`](./packages/core/src/sampleData.ts) | 기본 회원 정보, 오늘의 운동 종목/세트, 선물함 예시, 트레이너 회원 목록이 들어 있습니다. |

---

## 2. 화면별 파일 지도 (`apps/web/src/components/`)

- **공통 브랜드**
  - `BrandLogo.tsx`: 공용 로고 마크 (`sidebar`, `mobile`, `header` 3가지 크기 지원)
- **로그인 · 온보딩**
  - `LoginScreen.tsx`: 카카오/Google 로그인 버튼, 카카오톡 인앱 브라우저 외부 열기 안내, 체험 시작
  - `OnboardingWizard.tsx`: 6단계 신규 회원 체격·부상·희망 티어 입력 위자드
  - `AuthOnboardingView.tsx`: 위 두 파일을 한 번에 export하는 배럴 파일
- **오늘 운동 (`WorkoutView`)**
  - `WorkoutView.tsx`: 루틴 모드 선택, 3D/2D 근육 지도 전환, 모바일 집중 아코디언 제어
  - `workout/ExerciseSetCard.tsx`: 단일 종목 헤더, 실시간 추정 1RM, 세트 중량/횟수 입력 테이블
  - `workout/RestTimerBar.tsx`: 상단 휴식 타이머 필(`RestTimerPill`) 및 모바일 하단 미니 컨트롤 바(`RestTimerBar`)
  - `MuscleCanvas3D.tsx` / `Muscle3DDialog.tsx` / `MuscleMap2D.tsx`: 3D GLB 해부 뷰어(Draco 압축 모델)와 2D svg fallback
  - `StatusHudCard.tsx`: RPG 스타일 티어·MP·피라미드 상태창
- **기타 메뉴 화면**
  - `AvatarView.tsx`: 3단 능력치 피라미드와 5개 장비 슬롯 아바타 상태창
  - `CalendarStatsView.tsx`: 운동 캘린더, 최근 볼륨 추이, 30일 6대 부위 레이더 차트
  - `GiftsAccountView.tsx`: 트레이너 선물함 + 내 체격·부상 메모·희망 티어 설정
  - `TrainerView.tsx`: 트레이너용 회원 관리, 승급 승인, 루틴/코멘트 전송

---

## 3. 실행 · 타입체크 · 빌드 명령어

모든 명령어는 저장소 루트(`/Volumes/SSD980/code/rune-pt`)에서 실행합니다.

```bash
# 개발 서버 실행 (http://localhost:4173)
npm run dev

# 전체 TypeScript 타입 검사 (@rune-pt/core + @rune-pt/web)
npm run typecheck

# core 타입 검사 + 웹 프로덕션 번들 생성
npm run build
```

---

## 4. 작업 시 꼭 지킬 규칙

자세한 제품·보안·디자인 기준은 [`AGENTS.md`](./AGENTS.md), [`PRODUCT.md`](./PRODUCT.md), [`DESIGN.md`](./DESIGN.md)를 참고하세요.

1. JSX 안에 이모지 아이콘 대신 `lucide-react` 아이콘만 사용합니다.
2. 모든 숫자(중량, 횟수, 1RM, 티어 %, 나이/키/체중)에는 `.mono-num` 클래스를 붙입니다.
3. 3D 해부 뷰어(`MuscleCanvas3D`)로 개인 식별/신체 정보(이름, 나이, 체중 등)를 넘기지 않고, 뷰어 하단의 `BodyParts3D © DBCLS (CC BY 4.0)` 출처 및 비의료 참고용 고지를 유지합니다.
4. 카카오 노랑(`#FEE500`)은 로그인 화면의 `카카오로 계속하기` 버튼에만 사용합니다.
