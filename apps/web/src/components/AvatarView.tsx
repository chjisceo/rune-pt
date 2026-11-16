import { useMemo, useState } from 'react';
import {
  Activity,
  Award,
  Crown,
  Footprints,
  Hand,
  Info,
  Layers,
  Shield,
  SlidersHorizontal,
  Star,
  Sword,
  Target,
} from 'lucide-react';
import {
  MUSCLE_META,
  TIER_COLORS,
  TIER_RANK_HINT,
  TIERS,
  ageTierCap,
  formatTierBadge,
  starProgressPct,
} from '@rune-pt/core';
import type {
  MemberProfile,
  PyramidStats,
  ThemeMode,
  TierProgress,
} from '@rune-pt/core';

export interface AvatarViewProps {
  member: MemberProfile;
  tierProgress: TierProgress[];
  pyramid: PyramidStats;
  theme: ThemeMode;
}

const SLOT_ORDER: readonly TierProgress['slot'][] = [
  '무기',
  '갑옷',
  '망토',
  '투구',
  '장갑',
  '신발',
];

function renderSlotIcon(slot: TierProgress['slot']) {
  const iconClass = 'w-4 h-4 shrink-0';
  switch (slot) {
    case '무기':
      return <Sword className={iconClass} />;
    case '갑옷':
      return <Shield className={iconClass} />;
    case '망토':
      return <Layers className={iconClass} />;
    case '투구':
      return <Crown className={iconClass} />;
    case '장갑':
      return <Hand className={iconClass} />;
    case '신발':
      return <Footprints className={iconClass} />;
  }
}

function formatRunTime(sec: number): string {
  const safe = Math.max(0, Math.round(sec));
  const mins = Math.floor(safe / 60);
  const rem = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

function renderWithMonoNumbers(text: string) {
  const parts = text.split(/(\d+(?:\.\d+)?)/g);
  return parts.map((part, idx) =>
    /^\d+(?:\.\d+)?$/.test(part) ? (
      <span key={idx} className="mono-num">
        {part}
      </span>
    ) : (
      <span key={idx}>{part}</span>
    ),
  );
}

function renderStars(count: number, accentColor: string, total = 8) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`별 ${count}개 / ${total}개`}>
      {Array.from({ length: total }).map((_, idx) => {
        const filled = idx < count;
        return (
          <Star
            key={idx}
            className="w-3.5 h-3.5"
            style={{
              color: filled ? accentColor : 'rgba(152, 171, 196, 0.35)',
              fill: filled ? accentColor : 'transparent',
            }}
          />
        );
      })}
    </span>
  );
}

export function AvatarView({
  member,
  tierProgress,
  pyramid,
  theme,
}: AvatarViewProps) {
  const orderedSlots = useMemo(() => {
    const rank = new Map(SLOT_ORDER.map((s, i) => [s, i]));
    return [...tierProgress].sort(
      (a, b) => (rank.get(a.slot) ?? 99) - (rank.get(b.slot) ?? 99),
    );
  }, [tierProgress]);

  const [selectedId, setSelectedId] = useState<string>(
    () => orderedSlots[0]?.exerciseId ?? '',
  );

  const selectedSlot = useMemo(
    () =>
      orderedSlots.find((item) => item.exerciseId === selectedId) ??
      orderedSlots[0] ??
      null,
    [orderedSlots, selectedId],
  );

  const { overallTierIndex, overallStars } = useMemo(() => {
    if (orderedSlots.length === 0) {
      return { overallTierIndex: 0, overallStars: 0 };
    }
    const avgTier =
      orderedSlots.reduce((sum, s) => sum + s.tierIndex, 0) /
      orderedSlots.length;
    const avgStars =
      orderedSlots.reduce((sum, s) => sum + s.stars, 0) / orderedSlots.length;
    const cap = ageTierCap(member.age);
    return {
      overallTierIndex: Math.min(cap, Math.max(0, Math.round(avgTier))),
      overallStars: Math.min(8, Math.max(0, Math.round(avgStars))),
    };
  }, [orderedSlots, member.age]);

  const overallColor = TIER_COLORS[overallTierIndex] ?? TIER_COLORS[0];
  const hopeTierIdx = Math.max(
    0,
    Math.min(TIERS.length - 1, member.hopeTierIndex),
  );
  const hopeColor = TIER_COLORS[hopeTierIdx] ?? TIER_COLORS[0];
  const tierDelta = hopeTierIdx - overallTierIndex;

  const selectedCalibration = useMemo(() => {
    if (!selectedSlot) return null;
    const bw = Math.max(25, member.bodyKg);
    const ratio = Math.round((selectedSlot.e1rmKg / bw) * 100) / 100;
    const sexLabel = member.sex === 'M' ? '남성' : '여성';
    const capIdx = ageTierCap(member.age);
    const isRun = selectedSlot.exerciseId === 'run5k';
    const progressPct = starProgressPct(selectedSlot.mp, selectedSlot.tierIndex);

    return {
      ratio,
      sexLabel,
      capIdx,
      isRun,
      progressPct,
    };
  }, [selectedSlot, member]);

  return (
    <div className="space-y-5">
      {/* Top Cosmic-Navy Status HUD */}
      <section className="hud-panel p-5 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Overall Calibrated Tier & Hope Comparison */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--hud-ink)]">
                아바타 상태창
              </h2>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap"
                style={{
                  borderColor: overallColor,
                  backgroundColor: 'var(--hud-soft)',
                  color: 'var(--hud-ink)',
                }}
              >
                <Award className="w-3.5 h-3.5" style={{ color: overallColor }} />
                <span>종합 보정 티어</span>
              </span>
            </div>

            <div
              className="rounded-xl p-4 border space-y-3"
              style={{
                borderColor: 'var(--hud-border)',
                backgroundColor: 'var(--hud-surface)',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border"
                    style={{
                      borderColor: overallColor,
                      backgroundColor: 'var(--hud-soft)',
                    }}
                  >
                    <Shield className="h-5 w-5" style={{ color: overallColor }} aria-hidden="true" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-2xl font-extrabold tracking-tight"
                        style={{ color: overallColor }}
                      >
                        {TIERS[overallTierIndex]}
                      </span>
                      <span
                        className="mono-num text-sm font-semibold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: 'var(--hud-surface-pill)',
                          color: 'var(--hud-ink-soft)',
                        }}
                      >
                        {overallStars}/8
                      </span>
                    </div>
                    <div className="mt-1">{renderStars(overallStars, overallColor)}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[var(--hud-muted)]">보정 기준</div>
                  <div className="text-xs font-medium text-[var(--hud-ink-soft)]">
                    {member.sex === 'M' ? '남성' : '여성'} · 만{' '}
                    <span className="mono-num">{member.age}</span>세 ·{' '}
                    <span className="mono-num">{member.bodyKg}</span>kg
                  </div>
                </div>
              </div>

              <p className="text-sm text-[var(--hud-ink-soft)]">
                {renderWithMonoNumbers(TIER_RANK_HINT[overallTierIndex] ?? '')}
              </p>

              {/* Hope Tier Comparison */}
              <div
                className="pt-3 border-t flex flex-wrap items-center justify-between gap-3"
                style={{ borderColor: 'var(--hud-border-subtle)' }}
              >
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-[var(--hud-cyan)]" />
                  <span className="text-[var(--hud-muted)]">희망 목표 티어:</span>
                  <span className="font-bold" style={{ color: hopeColor }}>
                    {TIERS[hopeTierIdx]}
                  </span>
                </div>
                <div
                  className="text-xs font-semibold px-2.5 py-1 rounded-md border whitespace-nowrap"
                  style={{
                    backgroundColor: 'var(--hud-surface-pill)',
                    borderColor: 'var(--hud-border-subtle)',
                    color: 'var(--hud-ink)',
                  }}
                >
                  {tierDelta > 0 ? (
                    <>
                      목표까지 <span className="mono-num">+{tierDelta}</span> 티어
                    </>
                  ) : tierDelta === 0 ? (
                    <span>희망 티어 도달</span>
                  ) : (
                    <>
                      목표 초과 <span className="mono-num">+{Math.abs(tierDelta)}</span> 티어
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Pyramid Legend Row */}
            <div className="grid grid-cols-3 gap-2.5">
              <div
                className="rounded-lg px-3 py-2.5 border"
                style={{
                  backgroundColor: 'var(--hud-surface)',
                  borderColor: 'var(--hud-border-subtle)',
                }}
              >
                <div className="text-xs text-[var(--hud-muted)]">기반 · 출석/안정</div>
                <div className="mono-num text-lg font-bold text-[var(--hud-cyan)]">
                  {pyramid.foundation}%
                </div>
              </div>
              <div
                className="rounded-lg px-3 py-2.5 border"
                style={{
                  backgroundColor: 'var(--hud-surface)',
                  borderColor: 'var(--hud-border-subtle)',
                }}
              >
                <div className="text-xs text-[var(--hud-muted)]">고지 · 볼륨/밸런스</div>
                <div className="mono-num text-lg font-bold text-[var(--hud-blue)]">
                  {pyramid.highland}%
                </div>
              </div>
              <div
                className="rounded-lg px-3 py-2.5 border"
                style={{
                  backgroundColor: 'var(--hud-surface)',
                  borderColor: 'var(--hud-border-subtle)',
                }}
              >
                <div className="text-xs text-[var(--hud-muted)]">정점 · 1RM/5km</div>
                <div className="mono-num text-lg font-bold text-[var(--hud-gold)]">
                  {pyramid.apex}%
                </div>
              </div>
            </div>
          </div>

          {/* Right: Architectural 3-Stage Pyramid SVG */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div
              className="w-full max-w-[330px] rounded-xl p-3 border"
              style={{
                backgroundColor: 'var(--hud-surface-deep)',
                borderColor: 'var(--hud-border)',
              }}
            >
              <svg
                viewBox="0 0 320 220"
                className="w-full h-auto"
                role="img"
                aria-label="3단계 능력치 피라미드: 기반, 고지, 정점"
              >
                {/* Subtle HUD horizontal gridlines */}
                <line x1="20" y1="78" x2="300" y2="78" stroke="var(--hud-blue)" strokeOpacity="0.18" strokeDasharray="3 4" />
                <line x1="20" y1="138" x2="300" y2="138" stroke="var(--hud-blue)" strokeOpacity="0.18" strokeDasharray="3 4" />
                <line x1="20" y1="198" x2="300" y2="198" stroke="var(--hud-blue)" strokeOpacity="0.24" />

                {/* Stage 3: 정점 (Apex) */}
                <polygon
                  points="160,18 118,74 202,74"
                  fill="rgba(234, 179, 84, 0.24)"
                  stroke="var(--hud-gold)"
                  strokeWidth="1.5"
                />
                <text
                  x="160"
                  y="53"
                  textAnchor="middle"
                  fill="var(--hud-ink)"
                  fontSize="11"
                  fontWeight="700"
                >
                  정점
                </text>
                <text
                  x="160"
                  y="68"
                  textAnchor="middle"
                  fill="var(--hud-gold)"
                  fontSize="12"
                  fontWeight="700"
                  className="mono-num"
                >
                  {pyramid.apex}%
                </text>

                {/* Stage 2: 고지 (Highland) */}
                <polygon
                  points="114,80 206,80 242,134 78,134"
                  fill="rgba(99, 179, 255, 0.20)"
                  stroke="var(--hud-blue)"
                  strokeWidth="1.5"
                />
                <text
                  x="160"
                  y="104"
                  textAnchor="middle"
                  fill="var(--hud-ink)"
                  fontSize="12"
                  fontWeight="700"
                >
                  고지
                </text>
                <text
                  x="160"
                  y="123"
                  textAnchor="middle"
                  fill="var(--hud-muted)"
                  fontSize="13"
                  fontWeight="700"
                  className="mono-num"
                >
                  {pyramid.highland}%
                </text>

                {/* Stage 1: 기반 (Foundation) */}
                <polygon
                  points="74,140 246,140 284,196 36,196"
                  fill="rgba(74, 212, 230, 0.18)"
                  stroke="var(--hud-cyan)"
                  strokeWidth="1.5"
                />
                <text
                  x="160"
                  y="165"
                  textAnchor="middle"
                  fill="var(--hud-ink)"
                  fontSize="12"
                  fontWeight="700"
                >
                  기반
                </text>
                <text
                  x="160"
                  y="184"
                  textAnchor="middle"
                  fill="var(--hud-cyan)"
                  fontSize="13"
                  fontWeight="700"
                  className="mono-num"
                >
                  {pyramid.foundation}%
                </text>
              </svg>
              <div className="mt-1 text-center text-[11px] text-[var(--hud-muted)]">
                3단계 피라미드 · 30일 누적 보정 지수
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Equipment / Rune Slot Grid */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>
            6대 룬 장비 슬롯
          </h3>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            슬롯을 선택하면 1RM · 체성분 보정 상세를 확인할 수 있습니다
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {orderedSlots.map((slot) => {
            const isSelected = selectedSlot?.exerciseId === slot.exerciseId;
            const tierColor = TIER_COLORS[slot.tierIndex] ?? TIER_COLORS[0];
            const muscleInfo = MUSCLE_META[slot.muscle];
            const muscleColor =
              theme === 'dark' ? muscleInfo.colorDark : muscleInfo.colorLight;
            const pct = starProgressPct(slot.mp, slot.tierIndex);
            const isRun = slot.exerciseId === 'run5k';

            return (
              <button
                key={slot.exerciseId}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedId(slot.exerciseId)}
                className="surface-card text-left overflow-hidden transition-all cursor-pointer focus:outline-none"
                style={{
                  borderColor: isSelected ? 'var(--cyan)' : 'var(--border)',
                  boxShadow: isSelected
                    ? '0 0 0 1px var(--cyan), 0 8px 20px rgba(74, 212, 230, 0.12)'
                    : 'none',
                }}
              >
                {/* Tier Color Bar */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: tierColor }}
                />

                <div className="p-4 space-y-3">
                  {/* Header: Slot & Exercise */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="p-1.5 rounded-lg border shrink-0"
                        style={{
                          backgroundColor: 'var(--surface-elev)',
                          borderColor: 'var(--border)',
                          color: tierColor,
                        }}
                      >
                        {renderSlotIcon(slot.slot)}
                      </span>
                      <div className="min-w-0">
                        <div
                          className="font-bold text-sm truncate"
                          style={{ color: 'var(--ink)' }}
                        >
                          {slot.slot} · {slot.exerciseName}
                        </div>
                        <div
                          className="text-xs font-medium mt-0.5"
                          style={{ color: muscleColor }}
                        >
                          {muscleInfo.label}
                        </div>
                      </div>
                    </div>

                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-md shrink-0"
                      style={{
                        backgroundColor: 'var(--surface-elev)',
                        color: tierColor,
                        border: `1px solid ${tierColor}`,
                      }}
                    >
                      {TIERS[slot.tierIndex]}
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center justify-between gap-2">
                    {renderStars(slot.stars, tierColor)}
                    <span
                      className="mono-num text-xs font-semibold"
                      style={{ color: 'var(--ink-secondary)' }}
                    >
                      {slot.stars}/8
                    </span>
                  </div>

                  {/* e1RM & Next Tier Progress */}
                  <div
                    className="pt-2.5 border-t space-y-2"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-baseline justify-between text-xs">
                      <span style={{ color: 'var(--muted)' }}>
                        {isRun ? '5km 기준 기록' : '추정 e1RM'}
                      </span>
                      <span
                        className="mono-num text-sm font-bold"
                        style={{ color: 'var(--ink)' }}
                      >
                        {isRun
                          ? `${formatRunTime(member.run5kSec)} (${slot.e1rmKg}분)`
                          : `${slot.e1rmKg} kg`}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span style={{ color: 'var(--muted)' }}>
                          다음 승급 진행도
                        </span>
                        <span
                          className="mono-num font-semibold"
                          style={{ color: 'var(--ink-secondary)' }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div
                        className="h-2 w-full rounded-full overflow-hidden"
                        style={{ backgroundColor: 'var(--bg-subtle)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: tierColor,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected Slot 1RM & Body-Data Calibration Note (No PII) */}
      {selectedSlot && selectedCalibration && (
        <section className="surface-card p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="w-5 h-5" style={{ color: 'var(--cyan)' }} aria-hidden="true" />
              <h3 className="text-base md:text-lg font-bold" style={{ color: 'var(--ink)' }}>
                {selectedSlot.slot} · {selectedSlot.exerciseName} 보정 노트
              </h3>
            </div>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--cyan-soft)',
                color: 'var(--cyan)',
              }}
            >
              {renderWithMonoNumbers(
                formatTierBadge(selectedSlot.tierIndex, selectedSlot.stars),
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="surface-elev p-3.5 space-y-1">
              <div className="text-xs" style={{ color: 'var(--muted)' }}>
                {selectedCalibration.isRun ? '5km 기록 환산' : '체중 대비 1RM 비율'}
              </div>
              <div
                className="mono-num text-lg font-bold"
                style={{ color: 'var(--ink)' }}
              >
                {selectedCalibration.isRun
                  ? formatRunTime(member.run5kSec)
                  : `${selectedCalibration.ratio}× BW`}
              </div>
              <div className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                {selectedCalibration.isRun ? (
                  <>
                    환산 지수 <span className="mono-num">{selectedSlot.e1rmKg}</span>분 기준
                  </>
                ) : (
                  <>
                    추정 <span className="mono-num">{selectedSlot.e1rmKg} kg</span> / 체중{' '}
                    <span className="mono-num">{member.bodyKg} kg</span>
                  </>
                )}
              </div>
            </div>

            <div className="surface-elev p-3.5 space-y-1">
              <div className="text-xs" style={{ color: 'var(--muted)' }}>
                누적 MP / 승급 기준
              </div>
              <div
                className="mono-num text-lg font-bold"
                style={{ color: 'var(--ink)' }}
              >
                {selectedSlot.mp.toLocaleString()} / {selectedSlot.nextPromoMp.toLocaleString()} MP
              </div>
              <div className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                티어 진척률{' '}
                <span className="mono-num">{selectedCalibration.progressPct}%</span>
              </div>
            </div>

            <div className="surface-elev p-3.5 space-y-1">
              <div className="text-xs" style={{ color: 'var(--muted)' }}>
                인체 데이터 보정 계수
              </div>
              <div
                className="text-lg font-bold"
                style={{ color: 'var(--ink)' }}
              >
                {selectedCalibration.sexLabel} · 만{' '}
                <span className="mono-num">{member.age}</span>세
              </div>
              <div className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                신장 <span className="mono-num">{member.heightCm}</span>cm · 경력{' '}
                <span className="mono-num">{member.expMonths}</span>개월
              </div>
            </div>
          </div>

          <div
            className="rounded-lg p-3.5 flex items-start gap-2.5 text-xs leading-relaxed border"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--border)',
              color: 'var(--ink-secondary)',
            }}
          >
            <Info
              className="w-4 h-4 shrink-0 mt-0.5"
              style={{ color: 'var(--cyan)' }}
            />
            <div className="space-y-1">
              <p className="m-0">
                <Activity className="w-3.5 h-3.5 inline mr-1 -mt-0.5" style={{ color: 'var(--gold)' }} />
                {selectedCalibration.isRun ? (
                  <>
                    유산소 보정은 체중 <span className="mono-num">{member.bodyKg} kg</span>과
                    심폐 페이스(<span className="mono-num">{formatRunTime(member.run5kSec)}</span>)를
                    반영해 피라미드 정점 및 기반 점수에 반영됩니다.
                  </>
                ) : (
                  <>
                    Epley 추정 1RM(<span className="mono-num">{selectedSlot.e1rmKg} kg</span>)과
                    체중 대비 비율(<span className="mono-num">{selectedCalibration.ratio}×</span>)을
                    연령·성별 표준 곡선에 맞춰 보정했습니다.
                  </>
                )}
              </p>
              <p className="m-0" style={{ color: 'var(--muted)' }}>
                연령대 허용 상한:{' '}
                <span className="font-semibold" style={{ color: 'var(--ink-secondary)' }}>
                  {TIERS[selectedCalibration.capIdx]}
                </span>{' '}
                (개인 식별 정보 없이 신체 계측치만 계산에 사용됩니다).
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default AvatarView;
