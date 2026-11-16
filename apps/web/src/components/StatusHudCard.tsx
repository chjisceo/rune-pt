import { ChevronRight, Shield, Star, Target, TrendingUp } from 'lucide-react';
import { STAR_WIDTH_MP, TIERS, TIER_COLORS, starProgressPct } from '@rune-pt/core';
import type { PyramidStats } from '@rune-pt/core';

export interface StatusHudCardProps {
  tierIndex: number;
  stars: number;
  mp: number;
  hopeTierIndex: number;
  pyramid: PyramidStats;
  sessionEarnedMp: number;
  onOpenAvatar?: () => void;
}

const MAX_STARS = 8;

export function StatusHudCard({
  tierIndex,
  stars,
  mp,
  hopeTierIndex,
  pyramid,
  sessionEarnedMp,
  onOpenAvatar,
}: StatusHudCardProps) {
  const safeTier = Math.max(0, Math.min(TIERS.length - 1, tierIndex));
  const safeHope = Math.max(0, Math.min(TIERS.length - 1, hopeTierIndex));
  const clampedStars = Math.max(0, Math.min(MAX_STARS, stars));

  const tierName = TIERS[safeTier];
  const tierColor = TIER_COLORS[safeTier];
  const hopeTierName = TIERS[safeHope];
  const promoTargetMp = STAR_WIDTH_MP[safeTier] * 5;
  const effectiveMp = Math.max(0, mp + Math.max(0, sessionEarnedMp));
  const pct = starProgressPct(effectiveMp, safeTier);
  const tierGap = Math.max(0, safeHope - safeTier);

  const pyramidItems = [
    { key: 'foundation', label: '기반', score: pyramid.foundation, color: 'var(--hud-blue)' },
    { key: 'highland', label: '고지', score: pyramid.highland, color: 'var(--hud-cyan)' },
    { key: 'apex', label: '정점', score: pyramid.apex, color: 'var(--hud-gold)' },
  ] as const;

  return (
    <section
      className="hud-panel p-4"
      aria-label="캐릭터 상태창"
    >
      {/* 상단 티어 & 별 헤더 */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border"
              style={{
                borderColor: tierColor,
                backgroundColor: 'var(--hud-soft)',
              }}
            >
              <Shield className="h-4 w-4" style={{ color: tierColor }} />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold tracking-tight text-[var(--hud-ink)]">
                {tierName}
              </h2>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-1" aria-label={`현재 ${clampedStars}성`}>
            {Array.from({ length: MAX_STARS }, (_, idx) => {
              const filled = idx < clampedStars;
              return (
                <Star
                  key={idx}
                  className="h-3.5 w-3.5"
                  style={{
                    color: filled ? 'var(--hud-gold)' : 'var(--hud-border)',
                    fill: filled ? 'var(--hud-gold)' : 'transparent',
                  }}
                />
              );
            })}
            <span className="mono-num ml-1.5 text-xs font-semibold text-[var(--hud-gold)]">
              {clampedStars}/{MAX_STARS}성
            </span>
          </div>
        </div>

        {/* 희망 티어 진행 배지 */}
        <div
          className="shrink-0 rounded-lg border px-2.5 py-1.5 text-right"
          style={{
            borderColor: 'var(--hud-border)',
            backgroundColor: 'var(--hud-soft)',
          }}
        >
          <div className="flex items-center justify-end gap-1 text-[11px] font-medium text-[var(--hud-muted)]">
            <Target className="h-3 w-3 text-[var(--hud-blue)]" />
            <span>희망 티어</span>
          </div>
          <div className="mt-0.5 text-xs font-bold text-[var(--hud-ink)]">
            {hopeTierName}
            <span className="mono-num ml-1.5 text-[11px] font-medium text-[var(--hud-blue)]">
              {tierGap === 0 ? '달성' : `+${tierGap}단계`}
            </span>
          </div>
        </div>
      </div>

      {/* 3단 피라미드 능력치 스트립: 기반 · 고지 · 정점 */}
      <div
        className="mt-4 grid grid-cols-3 gap-2 rounded-lg border p-2.5"
        style={{
          borderColor: 'var(--hud-border-subtle)',
          backgroundColor: 'var(--hud-surface)',
        }}
      >
        {pyramidItems.map((item) => (
          <div key={item.key} className="text-center">
            <div className="text-[11px] font-medium text-[var(--hud-muted)]">{item.label}</div>
            <div
              className="mono-num mt-0.5 text-base font-bold"
              style={{ color: item.color }}
            >
              {item.score}
            </div>
            <div className="mx-auto mt-1 h-1 w-10 overflow-hidden rounded-full bg-[var(--hud-track-muted)]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(0, Math.min(100, item.score))}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 승급 XP(MP) 진행 바 */}
      <div className="mt-4">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-[var(--hud-ink-soft)]">승급 경험치</span>
          <div className="flex items-center gap-1.5">
            {sessionEarnedMp > 0 && (
              <span
                className="mono-num inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold whitespace-nowrap"
                style={{
                  borderColor: 'var(--hud-gold)',
                  backgroundColor: 'rgba(234, 179, 84, 0.16)',
                  color: 'var(--hud-gold)',
                }}
              >
                <TrendingUp className="h-3 w-3" />
                +{sessionEarnedMp.toLocaleString()} MP
              </span>
            )}
            <span className="mono-num font-bold text-[var(--hud-blue)]">{pct}%</span>
          </div>
        </div>

        <div
          className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full border"
          style={{
            borderColor: 'var(--hud-border)',
            backgroundColor: 'var(--hud-track)',
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${pct}%`,
              backgroundColor: pct >= 85 ? 'var(--hud-gold)' : 'var(--hud-blue)',
            }}
          />
        </div>

        <div className="mt-1.5 flex items-center justify-between text-[11px] text-[var(--hud-muted)]">
          <span className="mono-num">
            {effectiveMp.toLocaleString()} / {promoTargetMp.toLocaleString()} MP
          </span>
          <span className="mono-num">
            잔여 {Math.max(0, promoTargetMp - effectiveMp).toLocaleString()} MP
          </span>
        </div>
      </div>

      {/* 아바타 상태창 바로가기 버튼 */}
      {onOpenAvatar && (
        <button
          type="button"
          onClick={onOpenAvatar}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold whitespace-nowrap transition-colors hover:bg-[var(--hud-surface-pill)]"
          style={{
            borderColor: 'var(--hud-border)',
            backgroundColor: 'var(--hud-soft)',
            color: 'var(--hud-ink)',
          }}
        >
          <span>아바타 상태창 열기</span>
          <ChevronRight className="h-4 w-4 text-[var(--hud-gold)]" />
        </button>
      )}
    </section>
  );
}
