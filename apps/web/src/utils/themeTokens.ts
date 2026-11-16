/**
 * `tokens.css`에 정의된 CSS 변수를 JS(Three.js WebGL · 동적 SVG 등)에서 읽어옵니다.
 * 색상 테마를 바꾸고 싶을 때는 컴포넌트가 아니라 `apps/web/src/styles/tokens.css`만 수정하면 됩니다.
 */
export function readCssToken(varName: string, fallback: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value || fallback;
}
