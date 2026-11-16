import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Box,
  CheckCircle2,
  Layers,
  Lock,
  Maximize2,
  Move3d,
  Route,
  Save,
} from 'lucide-react';
import {
  MUSCLE_META,
  ROUTINE_MODES,
  SAFETY_ATTRIBUTION,
  calculateSessionVolume,
} from '@rune-pt/core';
import type {
  MuscleGroupId,
  PyramidStats,
  RoutineMode,
  ThemeMode,
  TierProgress,
  WorkoutExerciseLog,
  WorkoutSetRow,
} from '@rune-pt/core';
import { Muscle3DDialog } from './Muscle3DDialog';
import {
  MuscleCanvas3D,
  type AnatomyCameraPreset,
} from './MuscleCanvas3D';
import { MuscleMap2D } from './MuscleMap2D';
import { StatusHudCard } from './StatusHudCard';
import { ExerciseSetCard } from './workout/ExerciseSetCard';
import { RestTimerBar, RestTimerPill } from './workout/RestTimerBar';

export interface WorkoutViewProps {
  exercises: WorkoutExerciseLog[];
  mode: RoutineMode;
  trailOrderEnabled: boolean;
  theme: ThemeMode;
  tierProgress: TierProgress[];
  hopeTierIndex: number;
  pyramid: PyramidStats;
  savedAtLabel: string;
  onChangeMode: (m: RoutineMode) => void;
  onToggleTrailOrder: () => void;
  onUpdateSet: (exId: string, setId: string, patch: Partial<WorkoutSetRow>) => void;
  onAddSet: (exId: string) => void;
  onSaveSession: () => void;
  onOpenAvatar: () => void;
}

const DEFAULT_REST_SEC = 90;

const MODE_ORDER: RoutineMode[] = ['volume', 'strength', 'low'];

export function WorkoutView({
  exercises,
  mode,
  trailOrderEnabled,
  theme,
  tierProgress,
  hopeTierIndex,
  pyramid,
  savedAtLabel,
  onChangeMode,
  onToggleTrailOrder,
  onUpdateSet,
  onAddSet,
  onSaveSession,
  onOpenAvatar,
}: WorkoutViewProps) {
  const [activeExerciseId, setActiveExerciseId] = useState<string>(
    exercises[0]?.exerciseId ?? '',
  );
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroupId | 'all'>('all');
  const [focusScope, setFocusScope] = useState<'active' | 'routine'>('active');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const isNarrow =
      typeof window !== 'undefined' && window.innerWidth < 1024;
    if (isNarrow) {
      return new Set(exercises[0] ? [exercises[0].exerciseId] : []);
    }
    return new Set(exercises.map((e) => e.exerciseId));
  });
  const [anatomyMode, setAnatomyMode] = useState<'3d' | '2d'>('3d');
  const [inlinePreset, setInlinePreset] = useState<AnatomyCameraPreset>('quarter');
  const [inlinePresetTrigger, setInlinePresetTrigger] = useState<number>(0);
  const [inlineDragEnabled, setInlineDragEnabled] = useState<boolean>(false);
  const [is3DOpen, setIs3DOpen] = useState<boolean>(false);

  // 인터랙티브 휴식 타이머 (01:30 기본)
  const [restSeconds, setRestSeconds] = useState<number>(DEFAULT_REST_SEC);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setRestSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return DEFAULT_REST_SEC;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const orderedExercises = useMemo(() => {
    const base = [...exercises];
    if (trailOrderEnabled) {
      base.sort((a, b) => a.waypointOrder - b.waypointOrder);
    }
    return base;
  }, [exercises, trailOrderEnabled]);

  const visibleExercises = useMemo(() => {
    if (muscleFilter === 'all') return orderedExercises;
    return orderedExercises.filter((ex) => ex.muscle === muscleFilter);
  }, [orderedExercises, muscleFilter]);

  const highlightedMuscles = useMemo(() => {
    const unique = new Set<MuscleGroupId>();
    for (const ex of exercises) {
      unique.add(ex.muscle);
    }
    return Array.from(unique);
  }, [exercises]);

  const sessionStats = useMemo(() => {
    let rawVolumeKg = 0;
    let weightedMp = 0;
    let completedSets = 0;
    let totalSets = 0;

    for (const ex of exercises) {
      totalSets += ex.sets.length;
      const res = calculateSessionVolume(ex.sets, ex.estimated1RmKg);
      rawVolumeKg += res.rawVolumeKg;
      weightedMp += res.weightedMp;
      completedSets += res.completedCount;
    }
    return { rawVolumeKg, weightedMp, completedSets, totalSets };
  }, [exercises]);

  const activeExercise =
    exercises.find((ex) => ex.exerciseId === activeExerciseId) ?? orderedExercises[0];

  const hudTier = useMemo(() => {
    if (tierProgress.length === 0) {
      return { tierIndex: 0, stars: 0, mp: 0 };
    }
    const matched =
      (activeExercise &&
        tierProgress.find(
          (tp) =>
            tp.exerciseId === activeExercise.exerciseId ||
            tp.muscle === activeExercise.muscle,
        )) ??
      tierProgress[0];
    return {
      tierIndex: matched.tierIndex,
      stars: matched.stars,
      mp: matched.mp,
    };
  }, [tierProgress, activeExercise]);

  const handleToggleTimer = () => {
    if (restSeconds === 0) {
      setRestSeconds(DEFAULT_REST_SEC);
      setTimerRunning(true);
      return;
    }
    setTimerRunning((prev) => !prev);
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setRestSeconds(DEFAULT_REST_SEC);
  };

  const handleSelectWaypoint = (exerciseId: string) => {
    setActiveExerciseId(exerciseId);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(exerciseId);
      return next;
    });
    if (muscleFilter !== 'all') {
      const target = exercises.find((ex) => ex.exerciseId === exerciseId);
      if (target && target.muscle !== muscleFilter) {
        setMuscleFilter('all');
      }
    }
    window.requestAnimationFrame(() => {
      cardRefs.current[exerciseId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    });
  };

  const toggleExpandExercise = (exerciseId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
      } else {
        next.add(exerciseId);
      }
      return next;
    });
  };

  const allExpanded =
    visibleExercises.length > 0 &&
    visibleExercises.every((ex) => expandedIds.has(ex.exerciseId));

  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpandedIds(new Set(activeExerciseId ? [activeExerciseId] : []));
    } else {
      setExpandedIds(new Set(exercises.map((e) => e.exerciseId)));
    }
  };

  const handleSelectMuscle = (m: MuscleGroupId) => {
    setMuscleFilter((prev) => (prev === m ? 'all' : m));
  };

  const displayed3DMuscles = useMemo(() => {
    if (muscleFilter !== 'all') return [muscleFilter];
    if (focusScope === 'active' && activeExercise) {
      return [activeExercise.muscle];
    }
    return highlightedMuscles;
  }, [muscleFilter, focusScope, activeExercise, highlightedMuscles]);

  const isDark = theme === 'dark';

  return (
    <div className="w-full space-y-4">
      {/* 상단 헤더: 페이지 제목(아이브로우 없음) + 휴식 타이머 + 단일 골드 저장 CTA */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1
            className="text-xl font-bold tracking-tight sm:text-2xl"
            style={{ color: 'var(--ink)' }}
          >
            오늘의 운동 기록
          </h1>
          {savedAtLabel && (
            <span
              className="mono-num inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: 'var(--ok-soft)',
                borderColor: 'var(--ok)',
                color: 'var(--ok)',
              }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {savedAtLabel}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <RestTimerPill
            restSeconds={restSeconds}
            defaultRestSeconds={DEFAULT_REST_SEC}
            timerRunning={timerRunning}
            onToggleTimer={handleToggleTimer}
            onResetTimer={handleResetTimer}
          />

          {/* 단일 골드 프라이머리 CTA */}
          <button
            type="button"
            onClick={onSaveSession}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold whitespace-nowrap shadow-sm transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--gold)',
              color: 'var(--gold-ink)',
            }}
          >
            <Save className="h-4 w-4 shrink-0" />
            <span>오늘 운동 저장</span>
          </button>
        </div>
      </header>

      {/* 루틴 모드 + 산책로 순서 바 */}
      <section
        className="surface-card space-y-3 p-3.5"
        aria-label="루틴 모드 및 산책로 순서"
      >
        <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="운동 모드 선택">
            {MODE_ORDER.map((m) => {
              const info = ROUTINE_MODES[m];
              const active = mode === m;
              return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onChangeMode(m)}
                    aria-pressed={active}
                    className="rounded-lg border px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors"
                    style={{
                      backgroundColor: active ? 'var(--gold)' : 'var(--surface-elev)',
                      borderColor: active ? 'var(--gold)' : 'var(--border)',
                      color: active ? 'var(--gold-ink)' : 'var(--ink-secondary)',
                    }}
                  >
                    {info.name}
                  </button>
                );
              })}
              <span className="ml-1 text-xs" style={{ color: 'var(--muted)' }}>
                {ROUTINE_MODES[mode].summary}
              </span>
            </div>

            <div className="flex items-center gap-1.5 self-start md:self-auto">
              <button
                type="button"
                onClick={toggleExpandAll}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: 'var(--surface-elev)',
                  borderColor: 'var(--border)',
                  color: 'var(--ink-secondary)',
                }}
              >
                {allExpanded ? '현재만 펼치기' : '전체 펼치기'}
              </button>
              <button
                type="button"
                onClick={onToggleTrailOrder}
                aria-pressed={trailOrderEnabled}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: trailOrderEnabled ? 'var(--cyan-soft)' : 'var(--surface-elev)',
                  borderColor: trailOrderEnabled ? 'var(--cyan)' : 'var(--border)',
                  color: trailOrderEnabled ? 'var(--cyan)' : 'var(--ink-secondary)',
                }}
              >
                <Route className="h-3.5 w-3.5 shrink-0" />
                <span>산책로 순서</span>
              </button>
            </div>
        </div>

        {/* 1 → 2 → 3 → 4 클릭형 경유지 필 + 실시간 세션 요약 */}
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-t pt-2.5"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            {orderedExercises.map((ex, idx) => {
              const isSelected = activeExerciseId === ex.exerciseId;
              const allDone = ex.sets.length > 0 && ex.sets.every((s) => s.done);
              return (
                <div key={ex.exerciseId} className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectWaypoint(ex.exerciseId)}
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors"
                    style={{
                      backgroundColor: isSelected
                        ? 'var(--surface-elev)'
                        : allDone
                          ? 'var(--ok-soft)'
                          : 'var(--bg-subtle)',
                      borderColor: isSelected
                        ? 'var(--gold)'
                        : allDone
                          ? 'var(--ok)'
                          : 'var(--border)',
                      color: isSelected
                        ? 'var(--ink)'
                        : allDone
                          ? 'var(--ok)'
                          : 'var(--ink-secondary)',
                    }}
                  >
                    <span
                      className="mono-num inline-flex h-4 w-4 items-center justify-center rounded-full text-[11px] font-bold"
                      style={{
                        backgroundColor: isSelected
                          ? 'var(--gold)'
                          : allDone
                            ? 'var(--ok)'
                            : 'var(--border-strong)',
                        color: isSelected
                          ? 'var(--gold-ink)'
                          : allDone
                            ? '#ffffff'
                            : 'var(--ink)',
                      }}
                    >
                      {ex.waypointOrder}
                    </span>
                    <span className="max-w-[116px] truncate">{ex.name}</span>
                  </button>
                  {idx < orderedExercises.length - 1 && (
                    <ArrowRight
                      className="h-3 w-3 shrink-0"
                      style={{ color: 'var(--muted)' }}
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
            <span>
              완료{' '}
              <strong className="mono-num" style={{ color: 'var(--ink)' }}>
                {sessionStats.completedSets}/{sessionStats.totalSets}
              </strong>
              세트
            </span>
            <span>
              볼륨{' '}
              <strong className="mono-num" style={{ color: 'var(--ink)' }}>
                {sessionStats.rawVolumeKg.toLocaleString()}kg
              </strong>
            </span>
          </div>
        </div>
      </section>

      {/* 2컬럼 메인 레이아웃: 좌측/중앙 운동 기록 카드 + 우측 368px 레일 */}
      <div className="flex flex-col items-start gap-6 lg:flex-row">
        {/* 중앙 운동 카드 목록 */}
        <div className="w-full min-w-0 flex-1 space-y-4">
          {muscleFilter !== 'all' && (
            <div
              className="flex items-center justify-between rounded-lg border px-3.5 py-2 text-xs"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border-strong)',
                color: 'var(--ink-secondary)',
              }}
            >
              <span>
                근육 필터 적용됨:{' '}
                <strong style={{ color: 'var(--ink)' }}>
                  {MUSCLE_META[muscleFilter].label}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => setMuscleFilter('all')}
                className="font-bold underline-offset-2 hover:underline"
                style={{ color: 'var(--cyan)' }}
              >
                전체 보기
              </button>
            </div>
          )}

          {visibleExercises.map((ex) => (
            <ExerciseSetCard
              key={ex.exerciseId}
              exercise={ex}
              isDark={isDark}
              isHighlighted={activeExerciseId === ex.exerciseId}
              isExpanded={expandedIds.has(ex.exerciseId)}
              onSelectCard={setActiveExerciseId}
              onToggleExpand={toggleExpandExercise}
              onUpdateSet={onUpdateSet}
              onAddSet={onAddSet}
              onSetCompleted={() => {
                setRestSeconds(DEFAULT_REST_SEC);
                setTimerRunning(true);
              }}
              cardRef={(el) => {
                cardRefs.current[ex.exerciseId] = el;
              }}
            />
          ))}
        </div>

        {/* 우측 368px 레일: 기본 3D 해부 지도(2D 전환 가능) + RPG 상태창 HUD */}
        <aside className="w-full shrink-0 space-y-4 lg:sticky lg:top-6 lg:w-[368px]">
          <section className="surface-card p-4" aria-label="오늘의 자극 근육 지도">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
                오늘의 자극 부위
              </h2>

              <div className="flex items-center gap-1.5">
                <div
                  className="inline-flex rounded-lg border p-0.5"
                  style={{
                    backgroundColor: 'var(--surface-elev)',
                    borderColor: 'var(--border)',
                  }}
                  role="tablist"
                  aria-label="해부 뷰어 모드"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={anatomyMode === '3d'}
                    onClick={() => setAnatomyMode('3d')}
                    className="inline-flex min-h-[30px] items-center gap-1 rounded-md px-2 py-1 text-xs font-bold whitespace-nowrap transition-colors"
                    style={{
                      backgroundColor:
                        anatomyMode === '3d' ? 'var(--cyan-soft)' : 'transparent',
                      color:
                        anatomyMode === '3d' ? 'var(--cyan)' : 'var(--muted)',
                    }}
                  >
                    <Box className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="mono-num">3D</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={anatomyMode === '2d'}
                    onClick={() => setAnatomyMode('2d')}
                    className="inline-flex min-h-[30px] items-center gap-1 rounded-md px-2 py-1 text-xs font-bold whitespace-nowrap transition-colors"
                    style={{
                      backgroundColor:
                        anatomyMode === '2d' ? 'var(--cyan-soft)' : 'transparent',
                      color:
                        anatomyMode === '2d' ? 'var(--cyan)' : 'var(--muted)',
                    }}
                  >
                    <Layers className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="mono-num">2D</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIs3DOpen(true)}
                  aria-label="3D 근육 큰 화면으로 열기"
                  className="inline-flex min-h-[32px] items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold whitespace-nowrap transition-colors"
                  style={{
                    backgroundColor: 'var(--cyan-soft)',
                    borderColor: 'var(--cyan)',
                    color: 'var(--cyan)',
                  }}
                >
                  <Maximize2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>큰 화면</span>
                </button>
              </div>
            </div>

            {anatomyMode === '3d' ? (
              <div className="space-y-2.5">
                <MuscleCanvas3D
                  highlightedMuscles={displayed3DMuscles}
                  theme={theme}
                  preset={inlinePreset}
                  presetTrigger={inlinePresetTrigger}
                  showSkeleton={false}
                  dimUnselected={true}
                  dragEnabled={inlineDragEnabled}
                  heightPx={268}
                />

                {/* 각도 프리셋 & 모바일 스크롤 보호 360도 회전 토글 */}
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    {(
                      [
                        { id: 'front', label: '전면' },
                        { id: 'quarter', label: '45°' },
                        { id: 'back', label: '후면' },
                      ] as const
                    ).map((item) => {
                      const active = inlinePreset === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setInlinePreset(item.id);
                            setInlinePresetTrigger((n) => n + 1);
                          }}
                          className={`min-h-[34px] rounded-lg border px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                            item.id === 'quarter' ? 'mono-num' : ''
                          }`}
                          style={{
                            backgroundColor: active
                              ? 'var(--cyan-soft)'
                              : 'var(--surface-elev)',
                            borderColor: active
                              ? 'var(--cyan)'
                              : 'var(--border)',
                            color: active ? 'var(--cyan)' : 'var(--ink)',
                          }}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setInlineDragEnabled((prev) => !prev)}
                    aria-pressed={inlineDragEnabled}
                    className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors"
                    style={{
                      backgroundColor: inlineDragEnabled
                        ? 'var(--cyan-soft)'
                        : 'var(--surface-elev)',
                      borderColor: inlineDragEnabled
                        ? 'var(--cyan)'
                        : 'var(--border)',
                      color: inlineDragEnabled
                        ? 'var(--cyan)'
                        : 'var(--muted)',
                    }}
                  >
                    {inlineDragEnabled ? (
                      <Move3d className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span>
                      {inlineDragEnabled ? (
                        '회전 잠그기'
                      ) : (
                        <>
                          <span className="mono-num">360°</span> 회전
                        </>
                      )}
                    </span>
                  </button>
                </div>

                {/* 선택 종목 / 전체 루틴 하이라이트 범위 & 부위 필터 칩 */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMuscleFilter('all');
                      setFocusScope('active');
                    }}
                    className="min-h-[32px] rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap transition-colors"
                    style={{
                      backgroundColor:
                        muscleFilter === 'all' && focusScope === 'active'
                          ? 'var(--gold)'
                          : 'var(--surface-elev)',
                      borderColor:
                        muscleFilter === 'all' && focusScope === 'active'
                          ? 'var(--gold)'
                          : 'var(--border)',
                      color:
                        muscleFilter === 'all' && focusScope === 'active'
                          ? 'var(--gold-ink)'
                          : 'var(--muted)',
                    }}
                  >
                    현재 종목
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMuscleFilter('all');
                      setFocusScope('routine');
                    }}
                    className="min-h-[32px] rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap transition-colors"
                    style={{
                      backgroundColor:
                        muscleFilter === 'all' && focusScope === 'routine'
                          ? 'var(--cyan-soft)'
                          : 'var(--surface-elev)',
                      borderColor:
                        muscleFilter === 'all' && focusScope === 'routine'
                          ? 'var(--cyan)'
                          : 'var(--border)',
                      color:
                        muscleFilter === 'all' && focusScope === 'routine'
                          ? 'var(--cyan)'
                          : 'var(--muted)',
                    }}
                  >
                    전체 루틴
                  </button>
                  {highlightedMuscles.map((muscleId) => {
                    const meta = MUSCLE_META[muscleId];
                    const selected = muscleFilter === muscleId;
                    return (
                      <button
                        key={muscleId}
                        type="button"
                        onClick={() => handleSelectMuscle(muscleId)}
                        className="min-h-[32px] rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap transition-colors"
                        style={{
                          backgroundColor: selected
                            ? 'var(--cyan-soft)'
                            : 'var(--surface-elev)',
                          borderColor: selected
                            ? 'var(--cyan)'
                            : 'var(--border)',
                          color: selected ? 'var(--cyan)' : 'var(--ink)',
                        }}
                      >
                        {meta?.label ?? muscleId}
                      </button>
                    );
                  })}
                </div>

                {/* 출처 및 비의료 참고용 고지 */}
                <p
                  className="text-[11px] leading-relaxed"
                  style={{ color: 'var(--muted)' }}
                >
                  {SAFETY_ATTRIBUTION.glbLicense} ·{' '}
                  {SAFETY_ATTRIBUTION.medicalNotice}
                </p>
              </div>
            ) : (
              <MuscleMap2D
                highlightedMuscles={highlightedMuscles}
                theme={theme}
                onSelectMuscle={handleSelectMuscle}
                activeFilter={muscleFilter}
              />
            )}
          </section>

          <StatusHudCard
            tierIndex={hudTier.tierIndex}
            stars={hudTier.stars}
            mp={hudTier.mp}
            hopeTierIndex={hopeTierIndex}
            pyramid={pyramid}
            sessionEarnedMp={sessionStats.weightedMp}
            onOpenAvatar={onOpenAvatar}
          />
        </aside>
      </div>

      <RestTimerBar
        restSeconds={restSeconds}
        defaultRestSeconds={DEFAULT_REST_SEC}
        timerRunning={timerRunning}
        onAddSeconds={(delta) => setRestSeconds((s) => s + delta)}
        onToggleTimer={handleToggleTimer}
        onResetTimer={handleResetTimer}
      />

      {/* 온디맨드 3D 해부 모달 */}
      <Muscle3DDialog
        open={is3DOpen}
        onClose={() => setIs3DOpen(false)}
        highlightedMuscles={displayed3DMuscles}
        primaryExerciseName={activeExercise?.name ?? '오늘의 루틴'}
        theme={theme}
      />
    </div>
  );
}
