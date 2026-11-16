import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Compass,
  Gift,
  HeartPulse,
  Info,
  RotateCcw,
  ScrollText,
  Sliders,
  Target,
  Trophy,
  UserCheck,
} from 'lucide-react';
import {
  TIER_COLORS,
  TIER_RANK_HINT,
  TIERS,
  ageTierCap,
  clampAge,
} from '@rune-pt/core';
import type { GiftItem, MemberProfile } from '@rune-pt/core';

export interface GiftsAccountViewProps {
  view: 'gifts' | 'account';
  gifts: GiftItem[];
  member: MemberProfile;
  onClaimGift: (id: string) => void;
  onUpdateMember: (patch: Partial<MemberProfile>) => void;
  onOpenOnboarding: () => void;
}

const GIFT_KIND_META: Record<
  GiftItem['kind'],
  { label: string; tone: 'gold' | 'ok' | 'cyan' }
> = {
  'tier-quest': { label: '승급 퀘스트', tone: 'gold' },
  'recovery-buff': { label: '회복 버프', tone: 'ok' },
  'routine-note': { label: '루틴 노트', tone: 'cyan' },
};

function renderGiftIcon(kind: GiftItem['kind']) {
  const cls = 'w-4 h-4 shrink-0';
  switch (kind) {
    case 'tier-quest':
      return <Trophy className={cls} />;
    case 'recovery-buff':
      return <HeartPulse className={cls} />;
    case 'routine-note':
      return <ScrollText className={cls} />;
  }
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

function formatSecToMmSs(totalSec: number): string {
  const safe = Math.max(60, Math.min(5400, Math.round(totalSec)));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function parseMmSsToSec(raw: string): number | null {
  const trimmed = raw.trim();
  const match = /^(\d{1,2}):([0-5]\d)$/.exec(trimmed);
  if (!match) return null;
  const mins = Number(match[1]);
  const secs = Number(match[2]);
  if (!Number.isFinite(mins) || !Number.isFinite(secs)) return null;
  return Math.max(600, Math.min(5400, mins * 60 + secs));
}

function clampRange(value: number, min: number, max: number, decimals = 0): number {
  if (!Number.isFinite(value)) return min;
  const clamped = Math.max(min, Math.min(max, value));
  if (decimals <= 0) return Math.round(clamped);
  const factor = 10 ** decimals;
  return Math.round(clamped * factor) / factor;
}

export function GiftsAccountView({
  view,
  gifts,
  member,
  onClaimGift,
  onUpdateMember,
  onOpenOnboarding,
}: GiftsAccountViewProps) {
  const unclaimedCount = useMemo(
    () => gifts.filter((g) => !g.claimed).length,
    [gifts],
  );

  // Account form drafts for smooth editing + strict clamping on commit
  const [ageDraft, setAgeDraft] = useState(String(member.age));
  const [heightDraft, setHeightDraft] = useState(String(member.heightCm));
  const [weightDraft, setWeightDraft] = useState(String(member.bodyKg));
  const [bodyFatDraft, setBodyFatDraft] = useState(
    member.bodyFatPct !== undefined ? String(member.bodyFatPct) : '',
  );
  const [runDraft, setRunDraft] = useState(formatSecToMmSs(member.run5kSec));

  useEffect(() => {
    setAgeDraft(String(member.age));
  }, [member.age]);

  useEffect(() => {
    setHeightDraft(String(member.heightCm));
  }, [member.heightCm]);

  useEffect(() => {
    setWeightDraft(String(member.bodyKg));
  }, [member.bodyKg]);

  useEffect(() => {
    setBodyFatDraft(
      member.bodyFatPct !== undefined ? String(member.bodyFatPct) : '',
    );
  }, [member.bodyFatPct]);

  useEffect(() => {
    setRunDraft(formatSecToMmSs(member.run5kSec));
  }, [member.run5kSec]);

  if (view === 'gifts') {
    return (
      <div className="space-y-5">
        {/* Gift Box Header */}
        <section className="surface-card p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Gift className="w-5 h-5" style={{ color: 'var(--gold)' }} />
            <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>
              선물함
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border"
              style={{
                backgroundColor:
                  unclaimedCount > 0 ? 'var(--cyan-soft)' : 'var(--bg-subtle)',
                borderColor:
                  unclaimedCount > 0 ? 'var(--cyan)' : 'var(--border)',
                color: unclaimedCount > 0 ? 'var(--cyan)' : 'var(--muted)',
              }}
            >
              <span>미확인 선물</span>
              <span className="mono-num">{unclaimedCount}</span>
              <span>건</span>
            </span>

            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              전체 <span className="mono-num font-semibold">{gifts.length}</span>건
            </span>
          </div>
        </section>

        {/* Gift Items List */}
        {gifts.length === 0 ? (
          <section className="surface-card p-8 text-center space-y-2">
            <Gift
              className="w-7 h-7 mx-auto"
              style={{ color: 'var(--muted)' }}
            />
            <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
              도착한 선물이 없습니다
            </div>
            <p className="text-xs m-0" style={{ color: 'var(--muted)' }}>
              트레이너가 보낸 승급 퀘스트나 회복 버프가 도착하면 이곳에 표시됩니다.
            </p>
          </section>
        ) : (
          <div className="space-y-3.5">
            {gifts.map((gift) => {
              const kindMeta = GIFT_KIND_META[gift.kind];
              const toneColor =
                kindMeta.tone === 'gold'
                  ? 'var(--gold)'
                  : kindMeta.tone === 'ok'
                    ? 'var(--ok)'
                    : 'var(--cyan)';

              return (
                <article
                  key={gift.id}
                  className="surface-card p-4 md:p-5 transition-all"
                  style={{
                    borderColor: gift.claimed
                      ? 'var(--border)'
                      : 'var(--border-strong)',
                    opacity: gift.claimed ? 0.88 : 1,
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor:
                              kindMeta.tone === 'ok'
                                ? 'var(--ok-soft)'
                                : kindMeta.tone === 'cyan'
                                  ? 'var(--cyan-soft)'
                                  : 'var(--bg-subtle)',
                            color: toneColor,
                            border: '1px solid var(--border)',
                          }}
                        >
                          {renderGiftIcon(gift.kind)}
                          <span>{kindMeta.label}</span>
                        </span>

                        <span
                          className="text-xs font-medium"
                          style={{ color: 'var(--ink-secondary)' }}
                        >
                          {gift.fromTrainer}
                        </span>

                        <span
                          className="inline-flex items-center gap-1 text-xs"
                          style={{ color: 'var(--muted)' }}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{renderWithMonoNumbers(gift.receivedAt)}</span>
                        </span>
                      </div>

                      <h3
                        className="text-base font-bold"
                        style={{ color: 'var(--ink)' }}
                      >
                        {renderWithMonoNumbers(gift.title)}
                      </h3>

                      <p
                        className="text-sm leading-relaxed m-0"
                        style={{ color: 'var(--ink-secondary)' }}
                      >
                        {renderWithMonoNumbers(gift.message)}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center sm:pt-1">
                      {gift.claimed ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold border"
                          style={{
                            backgroundColor: 'var(--ok-soft)',
                            borderColor: 'var(--ok)',
                            color: 'var(--ok)',
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>반영 완료</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onClaimGift(gift.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-transform active:scale-98 cursor-pointer"
                          style={{
                            backgroundColor: 'var(--gold)',
                            color: 'var(--gold-ink)',
                          }}
                        >
                          <Gift className="w-4 h-4" />
                          <span>수령 및 루틴 반영</span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Account / Body & Goal Settings View
  const currentAgeCap = ageTierCap(member.age);
  const parsedAgeDraft = Number(ageDraft);
  const ageOutOfRange =
    ageDraft.trim() !== '' &&
    (!Number.isFinite(parsedAgeDraft) ||
      parsedAgeDraft < 8 ||
      parsedAgeDraft > 90);

  const commitAge = () => {
    const clamped = clampAge(Number(ageDraft));
    setAgeDraft(String(clamped));
    if (clamped !== member.age) {
      onUpdateMember({ age: clamped });
    }
  };

  const commitHeight = () => {
    const clamped = clampRange(Number(heightDraft), 120, 230, 0);
    setHeightDraft(String(clamped));
    if (clamped !== member.heightCm) {
      onUpdateMember({ heightCm: clamped });
    }
  };

  const commitWeight = () => {
    const clamped = clampRange(Number(weightDraft), 25, 250, 1);
    setWeightDraft(String(clamped));
    if (clamped !== member.bodyKg) {
      onUpdateMember({ bodyKg: clamped });
    }
  };

  const commitBodyFat = () => {
    const trimmed = bodyFatDraft.trim();
    if (trimmed === '') {
      setBodyFatDraft('');
      if (member.bodyFatPct !== undefined) {
        onUpdateMember({ bodyFatPct: undefined });
      }
      return;
    }
    const clamped = clampRange(Number(trimmed), 3, 60, 1);
    setBodyFatDraft(String(clamped));
    if (clamped !== member.bodyFatPct) {
      onUpdateMember({ bodyFatPct: clamped });
    }
  };

  const commitRunTime = () => {
    const parsed = parseMmSsToSec(runDraft);
    if (parsed === null) {
      setRunDraft(formatSecToMmSs(member.run5kSec));
      return;
    }
    setRunDraft(formatSecToMmSs(parsed));
    if (parsed !== member.run5kSec) {
      onUpdateMember({ run5kSec: parsed });
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="surface-card p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-5 h-5" style={{ color: 'var(--cyan)' }} />
          <h2 className="text-xl font-bold whitespace-nowrap" style={{ color: 'var(--ink)' }}>
            체성분 · 희망티어
          </h2>
        </div>

        <span
          className="text-xs font-medium whitespace-nowrap"
          style={{ color: 'var(--muted)' }}
        >
          입력 변경 시 티어 상한·보정 계수가 즉시 반영돼요
        </span>
      </section>

      {/* Body Composition Form */}
      <section className="surface-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
            <h3 className="text-base font-bold" style={{ color: 'var(--ink)' }}>
              신체 계측 및 심폐 기준
            </h3>
          </div>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            입력 변경 시 티어 보정식에 즉시 반영됩니다
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Age (8~90 strictly clamped) */}
          <label className="surface-elev p-3.5 space-y-1.5 block">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span style={{ color: 'var(--ink-secondary)' }}>나이 (만 세)</span>
              <span
                className="text-[11px]"
                style={{ color: ageOutOfRange ? 'var(--warn)' : 'var(--cyan)' }}
              >
                만 <span className="mono-num">8~90</span>세 입력 가능
              </span>
            </div>
            <input
              type="number"
              min={8}
              max={90}
              step={1}
              value={ageDraft}
              onChange={(e) => {
                const raw = e.target.value;
                setAgeDraft(raw);
                const num = Number(raw);
                if (raw.trim() !== '' && Number.isFinite(num)) {
                  if (num > 90) {
                    const clamped = clampAge(num);
                    setAgeDraft(String(clamped));
                    onUpdateMember({ age: clamped });
                  } else if (num >= 8) {
                    onUpdateMember({ age: clampAge(num) });
                  }
                }
              }}
              onBlur={commitAge}
              className="mono-num w-full px-3 py-2 rounded-lg border text-sm font-bold focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: ageOutOfRange ? 'var(--warn)' : 'var(--border-strong)',
                color: 'var(--ink)',
              }}
            />
            <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
              연령 보정 상한:{' '}
              <strong style={{ color: TIER_COLORS[currentAgeCap] }}>
                {TIERS[currentAgeCap]}
              </strong>
            </div>
          </label>

          {/* Height (120~230 cm) */}
          <label className="surface-elev p-3.5 space-y-1.5 block">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span style={{ color: 'var(--ink-secondary)' }}>신장 (cm)</span>
              <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                <span className="mono-num">120~230</span>cm
              </span>
            </div>
            <input
              type="number"
              min={120}
              max={230}
              step={1}
              value={heightDraft}
              onChange={(e) => {
                const raw = e.target.value;
                setHeightDraft(raw);
                const num = Number(raw);
                if (raw.trim() !== '' && Number.isFinite(num) && num >= 120 && num <= 230) {
                  onUpdateMember({ heightCm: clampRange(num, 120, 230, 0) });
                }
              }}
              onBlur={commitHeight}
              className="mono-num w-full px-3 py-2 rounded-lg border text-sm font-bold focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-strong)',
                color: 'var(--ink)',
              }}
            />
            <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
              현재 적용:{' '}
              <span className="mono-num font-semibold">{member.heightCm}</span> cm
            </div>
          </label>

          {/* Weight (25~250 kg) */}
          <label className="surface-elev p-3.5 space-y-1.5 block">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span style={{ color: 'var(--ink-secondary)' }}>체중 (kg)</span>
              <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                <span className="mono-num">25~250</span>kg
              </span>
            </div>
            <input
              type="number"
              min={25}
              max={250}
              step={0.1}
              value={weightDraft}
              onChange={(e) => {
                const raw = e.target.value;
                setWeightDraft(raw);
                const num = Number(raw);
                if (raw.trim() !== '' && Number.isFinite(num) && num >= 25 && num <= 250) {
                  onUpdateMember({ bodyKg: clampRange(num, 25, 250, 1) });
                }
              }}
              onBlur={commitWeight}
              className="mono-num w-full px-3 py-2 rounded-lg border text-sm font-bold focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-strong)',
                color: 'var(--ink)',
              }}
            />
            <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
              상대 근력(<span className="mono-num">1RM/BW</span>) 산출 기준
            </div>
          </label>

          {/* Optional Body Fat % (3~60%) */}
          <label className="surface-elev p-3.5 space-y-1.5 block">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span style={{ color: 'var(--ink-secondary)' }}>체지방률 (선택)</span>
              <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                <span className="mono-num">3~60</span>%
              </span>
            </div>
            <input
              type="number"
              min={3}
              max={60}
              step={0.1}
              placeholder="선택 입력"
              value={bodyFatDraft}
              onChange={(e) => {
                const raw = e.target.value;
                setBodyFatDraft(raw);
                if (raw.trim() === '') {
                  onUpdateMember({ bodyFatPct: undefined });
                  return;
                }
                const num = Number(raw);
                if (Number.isFinite(num) && num >= 3 && num <= 60) {
                  onUpdateMember({ bodyFatPct: clampRange(num, 3, 60, 1) });
                }
              }}
              onBlur={commitBodyFat}
              className="mono-num w-full px-3 py-2 rounded-lg border text-sm font-bold focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-strong)',
                color: 'var(--ink)',
              }}
            />
            <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
              {member.bodyFatPct !== undefined ? (
                <>
                  제지방 참고치{' '}
                  <span className="mono-num font-semibold">
                    {(member.bodyKg * (1 - member.bodyFatPct / 100)).toFixed(1)}
                  </span>{' '}
                  kg
                </>
              ) : (
                '미입력 시 체중 기준만 사용'
              )}
            </div>
          </label>

          {/* 5km Run Time (mm:ss) */}
          <label className="surface-elev p-3.5 space-y-1.5 block">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span style={{ color: 'var(--ink-secondary)' }}>
                <span className="mono-num">5</span>km 달리기 기록
              </span>
              <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                mm:ss 형식
              </span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="26:20"
              value={runDraft}
              onChange={(e) => {
                const raw = e.target.value;
                setRunDraft(raw);
                const sec = parseMmSsToSec(raw);
                if (sec !== null) {
                  onUpdateMember({ run5kSec: sec });
                }
              }}
              onBlur={commitRunTime}
              className="mono-num w-full px-3 py-2 rounded-lg border text-sm font-bold focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-strong)',
                color: 'var(--ink)',
              }}
            />
            <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
              현재 저장:{' '}
              <span className="mono-num font-semibold">
                {formatSecToMmSs(member.run5kSec)}
              </span>{' '}
              (<span className="mono-num">{member.run5kSec}</span>초)
            </div>
          </label>
        </div>
      </section>

      {/* Hope Tier Selector */}
      <section className="surface-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" style={{ color: 'var(--gold)' }} />
            <h3 className="text-base font-bold" style={{ color: 'var(--ink)' }}>
              희망 목표 티어 선택
            </h3>
          </div>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full border"
            style={{
              backgroundColor: 'var(--surface-elev)',
              borderColor:
                TIER_COLORS[member.hopeTierIndex] ?? TIER_COLORS[0],
              color: TIER_COLORS[member.hopeTierIndex] ?? TIER_COLORS[0],
            }}
          >
            선택됨: {TIERS[member.hopeTierIndex] ?? TIERS[0]}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {TIERS.map((tierName, idx) => {
            const isSelected = member.hopeTierIndex === idx;
            const color = TIER_COLORS[idx] ?? TIER_COLORS[0];
            const exceedsCap = idx > currentAgeCap;

            return (
              <button
                key={tierName}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onUpdateMember({ hopeTierIndex: idx })}
                className="p-3 rounded-xl border text-left transition-all cursor-pointer focus:outline-none"
                style={{
                  backgroundColor: isSelected
                    ? 'var(--surface-elev)'
                    : 'var(--bg-subtle)',
                  borderColor: isSelected ? color : 'var(--border)',
                  boxShadow: isSelected ? `0 0 0 1px ${color}` : 'none',
                }}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span
                    className="mono-num text-[11px] font-semibold"
                    style={{ color: 'var(--muted)' }}
                  >
                    T{idx + 1}
                  </span>
                </div>
                <div
                  className="text-sm font-bold mt-1.5"
                  style={{ color: isSelected ? color : 'var(--ink)' }}
                >
                  {tierName}
                </div>
                {exceedsCap && (
                  <div
                    className="text-[10px] mt-0.5"
                    style={{ color: 'var(--muted)' }}
                  >
                    연령 상한 초과
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div
          className="rounded-lg p-3.5 border flex items-start gap-2.5 text-xs"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border)',
            color: 'var(--ink-secondary)',
          }}
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--cyan)' }} />
          <div className="space-y-1">
            <div className="font-semibold" style={{ color: 'var(--ink)' }}>
              {TIERS[member.hopeTierIndex]} 목표 안내
            </div>
            <p className="m-0">
              {renderWithMonoNumbers(
                TIER_RANK_HINT[member.hopeTierIndex] ?? '',
              )}
            </p>
          </div>
        </div>

        {/* Onboarding CTA Footer */}
        <div
          className="pt-3 border-t flex flex-wrap items-center justify-between gap-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
            <Compass className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
            <span>관심 부위·운동 경력·주의 부위를 단계별로 다시 설정할 수 있습니다.</span>
          </div>
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer"
            style={{
              backgroundColor: 'var(--cyan-soft)',
              color: 'var(--cyan)',
              border: '1px solid var(--cyan)',
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>온보딩 마법사 시작</span>
          </button>
        </div>
      </section>
    </div>
  );
}

export default GiftsAccountView;
