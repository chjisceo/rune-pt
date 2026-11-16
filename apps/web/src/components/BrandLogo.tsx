import { Shield } from 'lucide-react';

export interface BrandLogoProps {
  /** 화면 위치에 맞는 크기/구성 선택 */
  variant?: 'sidebar' | 'mobile' | 'header';
  /** 부가 문구 (예: 회원 이름 · 티어) */
  subtitle?: string;
}

/**
 * 룬PT 공용 브랜드 로고.
 * 추후 실제 로고 이미지(.svg / .png)로 교체할 때는
 * 아이콘 박스 안의 `<Shield />`만 `<img src="/logo.svg" alt="Rune-PT" ... />`로 바꾸면 전체 화면에 일괄 반영됩니다.
 */
export function BrandLogo({ variant = 'sidebar', subtitle }: BrandLogoProps) {
  const isHeader = variant === 'header';
  const boxClass = isHeader ? 'w-9 h-9' : 'w-8 h-8';
  const iconClass = isHeader ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div
        className={`${boxClass} shrink-0 rounded-lg bg-[var(--surface-elev)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--gold)]`}
      >
        <Shield className={iconClass} aria-hidden="true" />
      </div>

      {isHeader ? (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-lg font-extrabold tracking-tight text-[var(--ink)]">
            룬PT
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]">
            Rune-PT
          </span>
        </div>
      ) : (
        <div className="min-w-0">
          <div
            className={`${
              variant === 'mobile' ? 'text-sm leading-tight' : 'text-[15px] leading-none'
            } font-bold tracking-tight whitespace-nowrap`}
          >
            Rune-PT
          </div>
          {subtitle && (
            <div
              className={`text-[11px] text-[var(--muted)] truncate ${
                variant === 'sidebar' ? 'mt-1' : ''
              }`}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
