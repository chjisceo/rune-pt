@AGENTS.md

# Claude Code 작업 진입 안내

- **우선 읽기:** 작업 시작 전 루트의 `AGENTS.md`와 `PRODUCT.md`(있다면 `DESIGN.md` 포함)를 먼저 확인하고, 단일 HTML(`index.html`) 방식으로 되돌리지 마세요.
- **코드 수정 후 필수 검증:**
  ```bash
  npm run typecheck && npm run build
  # apps/live 를 건드렸다면
  npm run live:smoke
  ```
- **체크리스트 요약:**
  - 도메인 계산·상수·타입은 `packages/core/src/`에 두고, 웹 UI는 `apps/web/src/components/`에 작성합니다.
  - JSX에는 `lucide-react` 아이콘만 사용하고 이모지를 쓰지 않으며, 모든 숫자에 `.mono-num`을 적용합니다.
  - 제목 위에 eyebrow/kicker를 두지 않고, `#FEE500`은 카카오 로그인 버튼 전용으로만 사용합니다.
  - 외부 문자열은 `escapeHtml()`로 이스케이프하고, 클라이언트에 `service_role` 키를 절대 넣지 않으며, `stayfit-muscle-skeleton.glb`(`4.97MB` 무손실 Draco + 로컬 `/draco/`)는 로그인 화면에서 미리 fetch하지 않고 `3D` 해부 뷰어가 열릴 때만 로드합니다.
