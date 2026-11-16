import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  HeartPulse,
  Ruler,
  Shield,
  Target,
  Trophy,
  User,
  X,
} from 'lucide-react';
import {
  MUSCLE_META,
  TIERS,
  TIER_COLORS,
  TIER_RANK_HINT,
  ageTierCap,
  clampAge,
} from '@rune-pt/core';
import type { MemberProfile, MuscleGroupId, SexCode } from '@rune-pt/core';

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cyan)]';

export interface OnboardingWizardProps {
  initialMember: MemberProfile;
  onComplete: (m: MemberProfile) => void;
  onCancel: () => void;
}

const TOTAL_STEPS = 6;

const EXP_PRESETS = [
  { label: '입문', range: '0~2개월', months: 1 },
  { label: '초급', range: '3~11개월', months: 6 },
  { label: '중급', range: '12~35개월', months: 18 },
  { label: '숙련', range: '36개월+', months: 42 },
] as const;

const INJURY_PRESETS = [
  '우측 손목 과신전 주의',
  '어깨 전면/충돌 주의',
  '허리(요추) 부담 주의',
  '무릎 관절 주의',
  '팔꿈치 외측/내측 주의',
] as const;

const MUSCLE_ORDER: MuscleGroupId[] = ['chest', 'back', 'leg', 'shoulder', 'arm', 'core'];

export function OnboardingWizard({
  initialMember,
  onComplete,
  onCancel,
}: OnboardingWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>(initialMember.name || '신규 회원');
  const [ageInput, setAgeInput] = useState<number>(() => clampAge(initialMember.age));
  const [sex, setSex] = useState<SexCode>(initialMember.sex);

  const [heightCm, setHeightCm] = useState<number>(initialMember.heightCm);
  const [bodyKg, setBodyKg] = useState<number>(initialMember.bodyKg);
  const [bodyFatInput, setBodyFatInput] = useState<string>(
    initialMember.bodyFatPct !== undefined ? String(initialMember.bodyFatPct) : '',
  );

  const [expMonths, setExpMonths] = useState<number>(Math.max(0, initialMember.expMonths));
  const [interests, setInterests] = useState<MuscleGroupId[]>(
    initialMember.interests.length > 0 ? initialMember.interests : ['chest', 'back'],
  );
  const [injuries, setInjuries] = useState<string[]>(initialMember.injuries);
  const [customInjury, setCustomInjury] = useState<string>('');

  const safeAge = clampAge(ageInput);
  const maxTierAllowed = ageTierCap(safeAge);
  const [hopeTierIndex, setHopeTierIndex] = useState<number>(() =>
    Math.min(initialMember.hopeTierIndex, ageTierCap(clampAge(initialMember.age))),
  );

  const [validationError, setValidationError] = useState<string | null>(null);

  const clampedHopeTier = Math.min(hopeTierIndex, maxTierAllowed);

  const stepMeta = useMemo(() => {
    switch (step) {
      case 1:
        return {
          title: '기본 정보를 알려주세요',
          desc: (
            <>
              나이(<span className="mono-num">8</span>~<span className="mono-num">90</span>세)와
              성별은 체격 보정 티어 산출에 반영돼요.
            </>
          ),
          icon: User,
        };
      case 2:
        return {
          title: '신체 계측 값을 입력해주세요',
          desc: '체지방률은 선택 항목이에요. 비워두어도 티어 계산이 가능해요.',
          icon: Ruler,
        };
      case 3:
        return {
          title: '웨이트 트레이닝 경력은 어느 정도인가요?',
          desc: '초기 추천 루틴 볼륨과 웨이포인트 강도를 맞춰드려요.',
          icon: Activity,
        };
      case 4:
        return {
          title: '집중하고 싶은 부위를 선택해 주세요',
          desc: (
            <>
              오늘의 추천 루틴과 <span className="mono-num">30</span>일 밸런스 분석에 우선
              반영돼요.
            </>
          ),
          icon: Target,
        };
      case 5:
        return {
          title: '부상이나 주의가 필요한 부위가 있나요?',
          desc: '비의료 참고 메모로 기록되며 트레이너 코칭 시 우선 확인돼요.',
          icon: HeartPulse,
        };
      default:
        return {
          title: '목표로 삼고 싶은 희망 티어를 골라주세요',
          desc: '언제든 내 정보에서 다시 조정할 수 있어요.',
          icon: Trophy,
        };
    }
  }, [step]);

  const validateCurrentStep = (): boolean => {
    setValidationError(null);

    if (step === 1) {
      if (!name.trim()) {
        setValidationError('회원 이름 또는 닉네임을 입력해 주세요.');
        return false;
      }
      if (!Number.isFinite(ageInput) || ageInput < 8 || ageInput > 90) {
        const nextClamped = clampAge(ageInput);
        setAgeInput(nextClamped);
        setValidationError('나이는 8세 이상 90세 이하 범위로 자동 보정되었어요.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 230) {
        setValidationError('키는 120cm 이상 230cm 이하로 입력해 주세요.');
        return false;
      }
      if (!Number.isFinite(bodyKg) || bodyKg < 25 || bodyKg > 250) {
        setValidationError('몸무게는 25kg 이상 250kg 이하로 입력해 주세요.');
        return false;
      }
      if (bodyFatInput.trim() !== '') {
        const bf = Number(bodyFatInput);
        if (!Number.isFinite(bf) || bf < 3 || bf > 60) {
          setValidationError('체지방률은 3% 이상 60% 이하이거나 비워둘 수 있어요.');
          return false;
        }
      }
      return true;
    }

    if (step === 3) {
      if (!Number.isFinite(expMonths) || expMonths < 0 || expMonths > 360) {
        setValidationError('운동 경력은 0개월 이상 360개월 이하로 입력해 주세요.');
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (interests.length === 0) {
        setValidationError('최소 1개 이상의 집중 부위를 선택해 주세요.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (step < TOTAL_STEPS) {
      setStep((prev) => prev + 1);
      return;
    }

    const parsedBodyFat =
      bodyFatInput.trim() === ''
        ? undefined
        : Math.round(Number(bodyFatInput) * 10) / 10;

    onComplete({
      ...initialMember,
      name: name.trim(),
      age: safeAge,
      sex,
      heightCm: Math.round(heightCm * 10) / 10,
      bodyKg: Math.round(bodyKg * 10) / 10,
      bodyFatPct: parsedBodyFat,
      expMonths: Math.round(expMonths),
      interests,
      injuries,
      hopeTierIndex: clampedHopeTier,
    });
  };

  const handlePrev = () => {
    setValidationError(null);
    if (step === 1) {
      onCancel();
      return;
    }
    setStep((prev) => prev - 1);
  };

  const toggleInterest = (muscle: MuscleGroupId) => {
    setValidationError(null);
    setInterests((prev) =>
      prev.includes(muscle)
        ? prev.filter((item) => item !== muscle)
        : [...prev, muscle],
    );
  };

  const toggleInjuryPreset = (label: string) => {
    setInjuries((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label],
    );
  };

  const addCustomInjury = () => {
    const trimmed = customInjury.trim();
    if (!trimmed) return;
    if (!injuries.includes(trimmed)) {
      setInjuries((prev) => [...prev, trimmed]);
    }
    setCustomInjury('');
  };

  const StepIcon = stepMeta.icon;
  const progressPct = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col">
      <header className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[var(--gold)]" aria-hidden="true" />
          <span className="font-bold text-base">룬PT 신규 온보딩</span>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className={`min-h-[40px] px-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-elev)] text-xs font-semibold text-[var(--ink-secondary)] transition-colors ${FOCUS_RING}`}
        >
          로그인으로 돌아가기
        </button>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 flex flex-col justify-center">
        <div className="surface-card p-5 sm:p-7 space-y-6">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--muted)]">
              <span className="flex items-center gap-1.5 text-[var(--cyan)]">
                <StepIcon className="w-4 h-4" aria-hidden="true" />
                <span>
                  단계 <span className="mono-num">{step}</span> /{' '}
                  <span className="mono-num">{TOTAL_STEPS}</span>
                </span>
              </span>
              <span className="mono-num">{progressPct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--bg-subtle)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--cyan)] transition-all duration-200"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink)]">
              {stepMeta.title}
            </h2>
            <p className="text-sm text-[var(--muted)]">{stepMeta.desc}</p>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-[var(--ink-secondary)]">
                  이름 또는 닉네임
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={24}
                  placeholder="예: 김민준"
                  className={`w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--surface-elev)] border border-[var(--border)] text-sm text-[var(--ink)] ${FOCUS_RING}`}
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-[var(--ink-secondary)]">
                    나이 (<span className="mono-num">8</span>~<span className="mono-num">90</span>세)
                  </span>
                  <input
                    type="number"
                    min={8}
                    max={90}
                    value={ageInput}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setAgeInput(Number.isNaN(val) ? 8 : val);
                    }}
                    onBlur={() => setAgeInput((prev) => clampAge(prev))}
                    className={`w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--surface-elev)] border border-[var(--border)] text-sm text-[var(--ink)] mono-num ${FOCUS_RING}`}
                  />
                </label>

                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-[var(--ink-secondary)]">
                    성별 (계측 기준)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { code: 'M', label: '남성' },
                        { code: 'F', label: '여성' },
                      ] as const
                    ).map((opt) => {
                      const active = sex === opt.code;
                      return (
                        <button
                          key={opt.code}
                          type="button"
                          onClick={() => setSex(opt.code)}
                          className={`min-h-[44px] rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${FOCUS_RING} ${
                            active
                              ? 'border-[var(--cyan)] bg-[var(--cyan-soft)] text-[var(--ink)]'
                              : 'border-[var(--border)] bg-[var(--surface-elev)] text-[var(--ink-secondary)] hover:border-[var(--border-strong)]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {safeAge < 18 && (
                <div className="rounded-xl border border-[var(--gold)]/40 bg-[var(--surface-elev)] px-3.5 py-2.5 text-xs text-[var(--ink-secondary)]">
                  만 <span className="mono-num">{safeAge}</span>세 회원 보호 기준에 따라 최대 도전
                  티어가 <strong className="text-[var(--gold)]">{TIERS[maxTierAllowed]}</strong>
                  까지 안전 제한돼요.
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-[var(--ink-secondary)]">
                    키 (<span className="mono-num">120</span>~
                    <span className="mono-num">230</span> cm)
                  </span>
                  <input
                    type="number"
                    min={120}
                    max={230}
                    step={0.5}
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className={`w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--surface-elev)] border border-[var(--border)] text-sm text-[var(--ink)] mono-num ${FOCUS_RING}`}
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-[var(--ink-secondary)]">
                    몸무게 (<span className="mono-num">25</span>~
                    <span className="mono-num">250</span> kg)
                  </span>
                  <input
                    type="number"
                    min={25}
                    max={250}
                    step={0.1}
                    value={bodyKg}
                    onChange={(e) => setBodyKg(Number(e.target.value))}
                    className={`w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--surface-elev)] border border-[var(--border)] text-sm text-[var(--ink)] mono-num ${FOCUS_RING}`}
                  />
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-[var(--ink-secondary)]">
                  체지방률 선택 입력 (<span className="mono-num">3</span>~
                  <span className="mono-num">60</span> %, 미입력 가능)
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={3}
                    max={60}
                    step={0.1}
                    value={bodyFatInput}
                    onChange={(e) => setBodyFatInput(e.target.value)}
                    placeholder="예: 15.2 (비워두면 건너뛰기)"
                    className={`flex-1 min-h-[44px] px-3.5 rounded-xl bg-[var(--surface-elev)] border border-[var(--border)] text-sm text-[var(--ink)] mono-num ${FOCUS_RING}`}
                  />
                  {bodyFatInput !== '' && (
                    <button
                      type="button"
                      onClick={() => setBodyFatInput('')}
                      className={`min-h-[44px] px-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elev)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] ${FOCUS_RING}`}
                    >
                      비우기
                    </button>
                  )}
                </div>
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {EXP_PRESETS.map((preset) => {
                  const isClose =
                    (preset.months === 1 && expMonths <= 2) ||
                    (preset.months === 6 && expMonths >= 3 && expMonths <= 11) ||
                    (preset.months === 18 && expMonths >= 12 && expMonths <= 35) ||
                    (preset.months === 42 && expMonths >= 36);
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setExpMonths(preset.months)}
                      className={`min-h-[64px] p-3 rounded-xl border text-left transition-colors cursor-pointer ${FOCUS_RING} ${
                        isClose
                          ? 'border-[var(--cyan)] bg-[var(--cyan-soft)]'
                          : 'border-[var(--border)] bg-[var(--surface-elev)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      <div className="text-sm font-bold text-[var(--ink)]">{preset.label}</div>
                      <div className="text-xs text-[var(--muted)] mono-num mt-0.5">
                        {preset.range}
                      </div>
                    </button>
                  );
                })}
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-[var(--ink-secondary)]">
                  직접 입력 (개월 수, <span className="mono-num">0</span>~
                  <span className="mono-num">360</span>)
                </span>
                <input
                  type="number"
                  min={0}
                  max={360}
                  value={expMonths}
                  onChange={(e) => setExpMonths(Math.max(0, Number(e.target.value) || 0))}
                  className={`w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--surface-elev)] border border-[var(--border)] text-sm text-[var(--ink)] mono-num ${FOCUS_RING}`}
                />
              </label>
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {MUSCLE_ORDER.map((muscleId) => {
                const meta = MUSCLE_META[muscleId];
                const selected = interests.includes(muscleId);
                return (
                  <button
                    key={muscleId}
                    type="button"
                    onClick={() => toggleInterest(muscleId)}
                    className={`min-h-[56px] px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-left transition-colors cursor-pointer ${FOCUS_RING} ${
                      selected
                        ? 'border-[var(--cyan)] bg-[var(--cyan-soft)] text-[var(--ink)]'
                        : 'border-[var(--border)] bg-[var(--surface-elev)] text-[var(--ink-secondary)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <span className="text-sm font-bold">{meta.label}</span>
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        selected
                          ? 'bg-[var(--cyan)] border-[var(--cyan)] text-[#071020]'
                          : 'border-[var(--border-strong)]'
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setInjuries([])}
                  className={`min-h-[40px] px-3.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${FOCUS_RING} ${
                    injuries.length === 0
                      ? 'border-[var(--ok)] bg-[var(--ok-soft)] text-[var(--ink)]'
                      : 'border-[var(--border)] bg-[var(--surface-elev)] text-[var(--ink-secondary)]'
                  }`}
                >
                  특이사항 없음
                </button>
                {INJURY_PRESETS.map((item) => {
                  const active = injuries.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInjuryPreset(item)}
                      className={`min-h-[40px] px-3.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${FOCUS_RING} ${
                        active
                          ? 'border-[var(--warn)] bg-[var(--warn-soft)] text-[var(--ink)]'
                          : 'border-[var(--border)] bg-[var(--surface-elev)] text-[var(--ink-secondary)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInjury}
                  onChange={(e) => setCustomInjury(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomInjury();
                    }
                  }}
                  maxLength={60}
                  placeholder="직접 입력 (예: 좌측 발목 염좌 이력)"
                  className={`flex-1 min-h-[44px] px-3.5 rounded-xl bg-[var(--surface-elev)] border border-[var(--border)] text-sm text-[var(--ink)] ${FOCUS_RING}`}
                />
                <button
                  type="button"
                  onClick={addCustomInjury}
                  className={`min-h-[44px] px-4 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elev)] hover:bg-[var(--bg-subtle)] text-xs font-bold text-[var(--ink)] cursor-pointer ${FOCUS_RING}`}
                >
                  추가
                </button>
              </div>

              {injuries.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {injuries.map((inj) => (
                    <span
                      key={inj}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--warn-soft)] text-xs font-medium text-[var(--ink)]"
                    >
                      <span>{inj}</span>
                      <button
                        type="button"
                        onClick={() => toggleInjuryPreset(inj)}
                        aria-label={`${inj} 삭제`}
                        className="text-[var(--ink-secondary)] hover:text-[var(--ink)]"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-[var(--muted)]">
                의료 진단이 아닌 운동 강도 조절용 메모예요. 통증 발생 시에는 운동을 멈추고 전문가와
                상담해 주세요.
              </p>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {TIERS.map((tierName, idx) => {
                  const disabled = idx > maxTierAllowed;
                  const active = clampedHopeTier === idx;
                  return (
                    <button
                      key={tierName}
                      type="button"
                      disabled={disabled}
                      onClick={() => setHopeTierIndex(idx)}
                      className={`min-h-[56px] px-3.5 py-2.5 rounded-xl border text-left transition-colors ${FOCUS_RING} ${
                        disabled
                          ? 'opacity-40 cursor-not-allowed border-[var(--border)] bg-[var(--surface)]'
                          : active
                            ? 'border-[var(--cyan)] bg-[var(--cyan-soft)] cursor-pointer'
                            : 'border-[var(--border)] bg-[var(--surface-elev)] hover:border-[var(--border-strong)] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-sm font-bold text-[var(--ink)]">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: TIER_COLORS[idx] }}
                          />
                          <span>{tierName}</span>
                        </span>
                        <span className="text-[11px] font-semibold text-[var(--muted)] mono-num">
                          T{idx + 1}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)] mt-1 line-clamp-1">
                        {TIER_RANK_HINT[idx]}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="surface-elev p-3.5 text-xs text-[var(--ink-secondary)] space-y-1">
                <div className="font-bold text-[var(--ink)]">입력 요약</div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span>
                    {name.trim()} · <span className="mono-num">{safeAge}</span>세 (
                    {sex === 'M' ? '남성' : '여성'})
                  </span>
                  <span className="mono-num">
                    {heightCm}cm / {bodyKg}kg
                    {bodyFatInput.trim() !== '' ? ` / 체지방 ${bodyFatInput}%` : ''}
                  </span>
                  <span>
                    경력 <span className="mono-num">{expMonths}</span>개월
                  </span>
                  <span>목표 {TIERS[clampedHopeTier]}</span>
                </div>
              </div>
            </div>
          )}

          {validationError && (
            <div
              role="alert"
              className="rounded-xl border border-[var(--warn)]/40 bg-[var(--warn-soft)] px-3.5 py-2.5 text-xs font-medium text-[var(--ink)]"
            >
              {validationError}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={handlePrev}
              className={`min-h-[44px] px-4 rounded-xl border border-[var(--border)] bg-[var(--surface-elev)] hover:bg-[var(--bg-subtle)] text-sm font-semibold text-[var(--ink)] flex items-center gap-1.5 cursor-pointer ${FOCUS_RING}`}
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>{step === 1 ? '취소' : '이전'}</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className={`min-h-[44px] px-5 rounded-xl bg-[var(--cyan)] text-[#071020] hover:opacity-95 text-sm font-bold flex items-center gap-1.5 cursor-pointer ${FOCUS_RING}`}
            >
              <span>{step === TOTAL_STEPS ? '온보딩 완료' : '다음 단계'}</span>
              {step === TOTAL_STEPS ? (
                <Check className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
