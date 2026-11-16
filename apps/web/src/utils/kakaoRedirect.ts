const KAKAO_REDIRECT_KEY = 'rune_kakao_ext_attempted';

export function isKakaoTalkInApp(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/KAKAOTALK/i.test(ua)) return true;
  return new URLSearchParams(window.location.search).get('kakaotalk') === '1';
}

export function isRealKakaoTalkUa(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /KAKAOTALK/i.test(navigator.userAgent || '');
}

export function isAndroidDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent || '');
}

export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent || '');
}

/** 카카오톡 공식 외부 브라우저 전환 스킴 생성 */
export function buildKakaoExternalUrl(rawUrl?: string): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(rawUrl ?? window.location.href);
  url.searchParams.delete('kakaotalk');
  return `kakaotalk://web/openExternal?url=${encodeURIComponent(url.toString())}`;
}

/** 카카오톡 인앱 웹뷰에서 Safari / Chrome 등 외부 브라우저로 전환 시도 */
export function openExternalFromKakao(rawUrl?: string): boolean {
  if (typeof window === 'undefined') return false;
  const externalUrl = buildKakaoExternalUrl(rawUrl);
  if (!externalUrl) return false;
  window.location.href = externalUrl;
  return true;
}

/** 실제 카카오톡 인앱 진입 시 루프 없이 1회 자동 외부 브라우저 전환 시도 */
export function attemptAutoKakaoRedirect(): boolean {
  if (typeof window === 'undefined' || !isRealKakaoTalkUa()) return false;
  try {
    if (window.sessionStorage.getItem(KAKAO_REDIRECT_KEY) === '1') {
      return false;
    }
    window.sessionStorage.setItem(KAKAO_REDIRECT_KEY, '1');
  } catch {
    // sessionStorage 차단 시에도 1회 이동 허용
  }
  return openExternalFromKakao();
}
