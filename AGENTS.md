# Rune-PT (룬PT) 엔지니어링 & 디자인 가이드

이 문서는 **트레이너(코치)의 Claude Code**와 **Harry의 에이전트**가 `/Volumes/SSD980/code/rune-pt` 모노레포에서 일관된 구조·보안·UI 기준으로 작업하기 위한 공통 지침입니다.

---

## 1. 기준 문서 (Source of Truth)

모든 제품 정책, 보안 제약, 디자인 기준은 아래 두 문서를 최우선 규범으로 삼습니다.

- 제품 스펙·제약·도메인 규칙: [`PRODUCT.md`](./PRODUCT.md)
- 디자인 시스템·레이아웃·컴포넌트 규격: `DESIGN.md` (저장소 루트 기준, [`PRODUCT.md`](./PRODUCT.md)와 함께 유지)

코드 작성 전 반드시 [`PRODUCT.md`](./PRODUCT.md)의 운영 맥락(헬스장 390px 모바일 vs 데스크톱 1440px 코칭)과 보안·성능 제약을 확인하세요.

---

## 2. Path A 모노레포 구조

단일 HTML(`index.html`) 구조에서 벗어난 **Path A 모노레포** 아키텍처를 사용합니다.

```text
rune-pt/
├── package.json                 # npm workspaces 루트 (dev / build / typecheck)
├── tsconfig.base.json           # @rune-pt/core 경로 별칭 및 strict TypeScript 설정
├── README.md                    # 초보자용 유지보수 지도 (로고·색상·DB 교체 가이드)
├── PRODUCT.md                   # 제품 규범 문서
├── DESIGN.md                    # 디자인 시스템 규범 문서
├── packages/
│   └── core/                    # 순수 TypeScript 공유 도메인 패키지 (@rune-pt/core)
│       └── src/
│           ├── index.ts         # 공개 export 배럴
│           ├── types.ts         # MemberProfile, WorkoutSetRow, TierProgress, TrainerMemberSummary 등
│           ├── constants.ts     # TIERS, TIER_COLORS, MUSCLE_META, ROUTINE_MODES, SAFETY_ATTRIBUTION
│           ├── tierCore.ts      # Epley 1RM, 볼륨/MP 산출, clampAge, ageTierCap, escapeHtml
│           ├── repository.ts    # RuneDataRepository 인터페이스 (localStorage / Supabase 교체 경계)
│           └── sampleData.ts    # 데모/초기 샘플 데이터
├── apps/
│   ├── web/                     # Vite + React 19 + TypeScript + Tailwind CSS v4 (@rune-pt/web)
│   │   ├── index.html
│   │   ├── public/
│   │   │   ├── favicon.svg      # 브라우저 탭 파비콘 (단일 SVG)
│   │   │   ├── stayfit-muscle-skeleton.glb
│   │   │   └── draco/           # 로컬 Draco 디코더
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── styles/tokens.css            # 라이트/다크/HUD/3D 캔버스 색상 토큰
│   │       ├── services/localRuneRepository.ts  # localStorage 저장 어댑터
│   │       ├── utils/themeTokens.ts         # CSS 변수 읽기 헬퍼 (WebGL/SVG용)
│   │       └── components/
│   │           ├── BrandLogo.tsx            # 공용 브랜드 로고 (<BrandLogo />)
│   │           ├── LoginScreen.tsx          # 로그인 화면
│   │           ├── OnboardingWizard.tsx     # 6단계 온보딩 위자드
│   │           ├── AuthOnboardingView.tsx   # 호환용 re-export 배럴
│   │           ├── WorkoutView.tsx          # 오늘 운동 화면
│   │           ├── workout/                 # ExerciseSetCard, RestTimerBar 등 분할 카드
│   │           ├── AvatarView.tsx
│   │           ├── CalendarStatsView.tsx
│   │           ├── GiftsAccountView.tsx
│   │           ├── TrainerView.tsx
│   │           └── MuscleCanvas3D.tsx
│   └── mobile/                  # (향후 타깃) Expo + NativeWind / React Native Reusables
│                                # packages/core 도메인 로직·Supabase 어댑터·토큰을 그대로 재사용
└── design-review/               # 디자인 비교 및 스크린샷 아카이브
```

### 구조 원칙
1. **비즈니스/도메인 로직은 `packages/core/src/`에 둡니다.** React/DOM 의존성 없이 순수 TypeScript로 유지해 향후 `apps/mobile`(Expo)에서도 그대로 import할 수 있어야 합니다.
2. **웹 UI는 `apps/web/src/components/`로 모듈화합니다.**
3. **절대 단일 HTML 파일(`index.html` 한 파일에 JS/CSS/화면 전부 넣기)로 되돌리지 마세요.** (Do not revert back to single-file HTML.)

---

## 3. 절대 타협 불가 보안 · 도메인 가드레일

아래 규칙은 어떤 기능 추가나 리팩토링에서도 예외 없이 유지해야 합니다.

1. **클라이언트 키 격리:** 클라이언트 번들(`apps/web`, 향후 `apps/mobile`)에는 publishable / anon key만 사용합니다. `service_role` 또는 `sb_secret` 키를 절대로 포함하거나 노출하지 마세요.
2. **OAuth 리다이렉트 고정 & URL 정리:** Supabase OAuth `redirectTo`는 환경별로 검증된 고정 `APP_URL`만 사용합니다. 로그인 복귀 후 URL에 남은 `code`, `access_token` 파라미터는 `history.replaceState`로 즉시 제거합니다.
3. **XSS 이스케이프 필수:** 회원 이름, 부상 메모, 트레이너 코멘트, 선물함 제목/본문 등 사용자 입력 및 Supabase에서 읽어온 문자열은 렌더링·미리보기·전송 전 `packages/core/src/tierCore.ts`의 `escapeHtml()`(또는 `esc()`)로 정제합니다.
4. **`postMessage` 출처 검증:** 아바타/뷰어 프레임과 통신할 때 `targetOrigin`은 반드시 `location.origin`으로 고정하고, 수신 리스너에서 `event.origin === location.origin` 및 `event.source`를 검증합니다. (`'*'` 금지)
5. **3D 해부 뷰어 PII 전송 금지:** 성별, 나이, 키, 몸무게, 체지방률, 부상 메모 등 개인 식별·신체 정보를 3D 해부/아바타 뷰어나 외부 CDN으로 절대 전송하지 마세요.
6. **경량 Draco 3D GLB 로드 & 출처/비의료 고지:**
   - `stayfit-muscle-skeleton.glb`는 무손실 Draco 압축(`4.97MB`, ~99만 삼각형) + 로컬 `/draco/` 디코더로만 서빙하며, base64로 인라인하거나 로그인 화면에서 미리 fetch하지 마세요.
   - 운동 화면(`WorkoutView`)의 인라인 3D 해부 뷰어(기본 표시, `2D` 전환 가능) 또는 `큰 화면` 모달이 마운트될 때만 온디맨드로 로드하고, 뷰어 하단에 **`BodyParts3D © DBCLS (CC BY 4.0)`** 출처와 **비의료 참고용 고지**(`SAFETY_ATTRIBUTION`)를 반드시 표시합니다.
7. **온보딩 나이 가드 유지 (8~90세):**
   - 나이 범위는 `8 ~ 90`세(`clampAge`)를 유지하고, 만 18세 미만 안전 티어 상한(`ageTierCap`)을 유지합니다.
   - 최소 연령을 낮추거나 만 14세 미만 추가 개인정보 수집을 확장하지 마세요.
   - 키(`120~230cm`), 몸무게(`25~250kg`), 체지방률(`3~60%`, 선택) 검증 경계를 유지합니다.

---

## 4. UI · 디자인 · 접근성 규칙

- **아이콘:** `lucide-react` 아이콘만 사용합니다. **JSX 안에 이모지 아이콘을 넣지 마세요.**
- **숫자 서식:** 모든 숫자(중량, 횟수, 볼륨, 1RM, 나이, 키, 체중, 진행률 %, 별 개수, 회원 수 등)에는 `.mono-num` 클래스를 적용합니다 (`JetBrains Mono` + `tabular-nums`).
- **헤딩 계층:** `<h1>`~`<h3>` 제목 바로 위에 작은 eyebrow / kicker 라벨을 두지 마세요.
- **카카오 브랜드 색상 격리:** 카카오 노랑(`#FEE500`)과 텍스트(`#191919`)는 오직 **`카카오로 계속하기` 버튼에만** 사용합니다.
- **듀얼 테마 지원:** `apps/web/src/styles/tokens.css`의 CSS 변수(`--bg`, `--surface`, `--surface-elev`, `--ink`, `--muted`, `--cyan`, `--gold`, `--ok`, `--warn` 등)를 사용해 `dark`(Luminous Slate Dark)와 `light`(Warm Parchment Light) 모두 WCAG AA 대비를 유지합니다.
- **헬스장 한 손 조작성:** 모바일 주요 버튼/입력 터치 영역은 최소 `40px~44px` 이상, 키보드 포커스 링(`2px`)을 유지합니다.
- **한국어 어조:** 친절하고 실용적인 해요체 코칭 톤을 유지하고, 의학적 진단·치료 표현은 사용하지 않습니다.

---

## 5. 빌드 및 검증 명령어

작업 후 반드시 루트(`/Volumes/SSD980/code/rune-pt`)에서 타입체크와 프로덕션 빌드를 실행해 통과를 확인하세요.

```bash
# 1. packages/core + apps/web 전체 TypeScript 타입체크
npm run typecheck

# 2. core 타입체크 + Vite 프로덕션 번들 빌드
npm run build

# 3. 웹 개발 서버 실행 (http://localhost:4173)
npm run dev
```

특정 워크스페이스만 점검할 때:
```bash
npm --workspace @rune-pt/core run typecheck
npm --workspace @rune-pt/web run typecheck
npm --workspace @rune-pt/web run build
```
