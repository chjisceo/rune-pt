import {
  Check,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Minus,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { MUSCLE_META, estimate1Rm } from '@rune-pt/core';
import type { SetTag, WorkoutExerciseLog, WorkoutSetRow } from '@rune-pt/core';

export interface ExerciseSetCardProps {
  exercise: WorkoutExerciseLog;
  isDark: boolean;
  isHighlighted: boolean;
  isExpanded: boolean;
  onSelectCard: (exerciseId: string) => void;
  onToggleExpand: (exerciseId: string) => void;
  onUpdateSet: (exId: string, setId: string, patch: Partial<WorkoutSetRow>) => void;
  onAddSet: (exId: string) => void;
  onSetCompleted?: () => void;
  cardRef?: (el: HTMLElement | null) => void;
}

function getSetTagStyle(tag: SetTag): {
  label: string;
  color: string;
  bg: string;
  border: string;
} {
  if (tag === 'W') {
    return {
      label: 'W',
      color: 'var(--cyan)',
      bg: 'var(--cyan-soft)',
      border: 'var(--cyan)',
    };
  }
  if (tag === 'F') {
    return {
      label: 'F',
      color: 'var(--warn)',
      bg: 'var(--warn-soft)',
      border: 'var(--warn)',
    };
  }
  return {
    label: 'M',
    color: 'var(--gold)',
    bg: 'var(--surface-elev)',
    border: 'var(--gold)',
  };
}

/**
 * 오늘 운동 화면의 단일 운동 종목 + Hevy 스타일 세트 입력 카드.
 */
export function ExerciseSetCard({
  exercise: ex,
  isDark,
  isHighlighted,
  isExpanded,
  onSelectCard,
  onToggleExpand,
  onUpdateSet,
  onAddSet,
  onSetCompleted,
  cardRef,
}: ExerciseSetCardProps) {
  const muscleColor = isDark
    ? MUSCLE_META[ex.muscle].colorDark
    : MUSCLE_META[ex.muscle].colorLight;

  // 라이브 추정 1RM (완료된 세트 우선, 없으면 전체 유효 세트 중 최대치)
  const completedSets = ex.sets.filter((s) => s.done && s.kg > 0 && s.reps > 0);
  const doneCount = ex.sets.filter((s) => s.done).length;
  const candidateSets =
    completedSets.length > 0
      ? completedSets
      : ex.sets.filter((s) => s.kg > 0 && s.reps > 0);
  const live1Rm = candidateSets.reduce((best, s) => {
    const e = estimate1Rm(s.kg, s.reps);
    return e > best ? e : best;
  }, ex.estimated1RmKg);

  return (
    <article
      ref={cardRef}
      onClick={() => onSelectCard(ex.exerciseId)}
      className="surface-card overflow-hidden transition-colors"
      style={{
        borderColor: isHighlighted ? 'var(--gold)' : 'var(--border)',
      }}
    >
      {/* 운동 카드 헤더 (아코디언 토글 포함) */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={(e) => {
          e.stopPropagation();
          onSelectCard(ex.exerciseId);
          onToggleExpand(ex.exerciseId);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectCard(ex.exerciseId);
            onToggleExpand(ex.exerciseId);
          }
        }}
        className={`flex flex-wrap items-start justify-between gap-2.5 px-4 py-3.5 cursor-pointer select-none ${
          isExpanded ? 'border-b' : ''
        }`}
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="mono-num inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-xs font-bold"
              style={{
                backgroundColor: isHighlighted
                  ? 'var(--gold)'
                  : 'var(--surface-elev)',
                color: isHighlighted ? 'var(--gold-ink)' : 'var(--ink)',
              }}
            >
              {ex.waypointOrder}
            </span>
            <h2 className="text-base font-bold" style={{ color: 'var(--ink)' }}>
              {ex.name}
            </h2>
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap"
              style={{
                borderColor: muscleColor,
                color: muscleColor,
              }}
            >
              <Dumbbell className="h-3 w-3 shrink-0" />
              {MUSCLE_META[ex.muscle].label}
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {ex.subMuscles} · {ex.targetNote}
          </p>
        </div>

        {/* 실시간 추정 1RM + 완료 요약 + 접기/펼치기 */}
        <div className="flex shrink-0 items-center gap-1.5">
          {!isExpanded && (
            <span
              className="mono-num whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-semibold"
              style={{
                backgroundColor: 'var(--surface-elev)',
                borderColor: 'var(--border)',
                color: 'var(--ink-secondary)',
              }}
            >
              {doneCount}/{ex.sets.length}세트
            </span>
          )}
          <div
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs whitespace-nowrap"
            style={{
              backgroundColor: 'var(--surface-elev)',
              borderColor: 'var(--border)',
              color: 'var(--ink-secondary)',
            }}
          >
            <TrendingUp
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: 'var(--cyan)' }}
            />
            <span>추정 1RM</span>
            <strong className="mono-num" style={{ color: 'var(--ink)' }}>
              {live1Rm}kg
            </strong>
          </div>
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--surface-elev)',
              color: 'var(--muted)',
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            )}
          </span>
        </div>
      </div>

      {/* Hevy 스타일 세트 테이블 */}
      {isExpanded && (
        <div className="px-3 py-2 sm:px-4">
          {/* 테이블 컬럼 헤더 */}
          <div
            className="grid grid-cols-[36px_minmax(56px,1fr)_minmax(108px,1.25fr)_minmax(56px,0.75fr)_40px] items-center gap-1.5 px-1 py-1.5 text-[11px] font-bold uppercase tracking-wide whitespace-nowrap"
            style={{ color: 'var(--muted)' }}
          >
            <span className="text-center">SET</span>
            <span>이전 기록</span>
            <span className="text-center">KG</span>
            <span className="text-center">REPS</span>
            <span className="text-center">완료</span>
          </div>

          <div className="space-y-1.5">
            {ex.sets.map((row) => {
              const tagStyle = getSetTagStyle(row.tag);
              return (
                <div
                  key={row.id}
                  className="group grid grid-cols-[36px_minmax(56px,1fr)_minmax(108px,1.25fr)_minmax(56px,0.75fr)_40px] items-center gap-1.5 rounded-lg px-1 py-1.5 transition-colors"
                  style={{
                    backgroundColor: row.done ? 'var(--ok-soft)' : 'transparent',
                  }}
                >
                  {/* SET 배지 (W / M / F) */}
                  <div className="flex justify-center">
                    <span
                      className="mono-num inline-flex h-6 w-7 items-center justify-center rounded-md border text-xs font-bold"
                      style={{
                        color: tagStyle.color,
                        backgroundColor: tagStyle.bg,
                        borderColor: tagStyle.border,
                      }}
                    >
                      {tagStyle.label}
                    </span>
                  </div>

                  {/* 이전 기록 */}
                  <span
                    className="mono-num truncate text-xs"
                    style={{ color: 'var(--muted)' }}
                  >
                    {row.prevLabel}
                  </span>

                  {/* KG 입력 + -2.5 / +2.5 스텝퍼 */}
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateSet(ex.exerciseId, row.id, {
                          kg: Math.max(0, Math.round((row.kg - 2.5) * 10) / 10),
                        });
                      }}
                      aria-label="무게 2.5kg 감소"
                      title="-2.5kg"
                      className="inline-flex h-10 min-w-[30px] shrink-0 items-center justify-center rounded border px-1 text-[11px] font-semibold transition-opacity sm:h-9 sm:opacity-65 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                      style={{
                        backgroundColor: 'var(--surface-elev)',
                        borderColor: 'var(--border)',
                        color: 'var(--ink-secondary)',
                      }}
                    >
                      <Minus className="h-3.5 w-3.5 sm:hidden" />
                      <span className="mono-num hidden sm:inline">-2.5</span>
                    </button>
                    <input
                      type="number"
                      inputMode="decimal"
                      step={0.5}
                      min={0}
                      value={row.kg}
                      aria-label={`${ex.name} 세트 무게(kg)`}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        onUpdateSet(ex.exerciseId, row.id, {
                          kg: Number.isFinite(val) ? Math.max(0, val) : 0,
                        });
                      }}
                      className="mono-num h-10 w-12 rounded-md border px-1 text-center text-sm font-bold focus-visible:outline-2 focus-visible:outline-[var(--cyan)] sm:h-9 sm:w-14"
                      style={{
                        backgroundColor: 'var(--surface-elev)',
                        borderColor: 'var(--border)',
                        color: 'var(--ink)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateSet(ex.exerciseId, row.id, {
                          kg: Math.round((row.kg + 2.5) * 10) / 10,
                        });
                      }}
                      aria-label="무게 2.5kg 증가"
                      title="+2.5kg"
                      className="inline-flex h-10 min-w-[30px] shrink-0 items-center justify-center rounded border px-1 text-[11px] font-semibold transition-opacity sm:h-9 sm:opacity-65 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                      style={{
                        backgroundColor: 'var(--surface-elev)',
                        borderColor: 'var(--border)',
                        color: 'var(--ink-secondary)',
                      }}
                    >
                      <Plus className="h-3.5 w-3.5 sm:hidden" />
                      <span className="mono-num hidden sm:inline">+2.5</span>
                    </button>
                  </div>

                  {/* REPS 입력 */}
                  <div className="flex justify-center">
                    <input
                      type="number"
                      inputMode="numeric"
                      step={1}
                      min={0}
                      value={row.reps}
                      aria-label={`${ex.name} 세트 반복 수`}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        onUpdateSet(ex.exerciseId, row.id, {
                          reps: Number.isFinite(val) ? Math.max(0, val) : 0,
                        });
                      }}
                      className="mono-num h-10 w-12 rounded-md border px-1 text-center text-sm font-bold focus-visible:outline-2 focus-visible:outline-[var(--cyan)] sm:h-9 sm:w-14"
                      style={{
                        backgroundColor: 'var(--surface-elev)',
                        borderColor: 'var(--border)',
                        color: 'var(--ink)',
                      }}
                    />
                  </div>

                  {/* 완료 체크 버튼 */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextDone = !row.done;
                        onUpdateSet(ex.exerciseId, row.id, { done: nextDone });
                        if (nextDone) {
                          onSetCompleted?.();
                        }
                      }}
                      aria-pressed={row.done}
                      aria-label={row.done ? '세트 완료 취소' : '세트 완료'}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md border transition-colors sm:h-9 sm:w-9"
                      style={{
                        backgroundColor: row.done ? 'var(--ok)' : 'var(--surface-elev)',
                        borderColor: row.done ? 'var(--ok)' : 'var(--border-strong)',
                        color: row.done ? '#ffffff' : 'var(--muted)',
                      }}
                    >
                      <Check className="h-4 w-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* + 세트 추가 고스트 행 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddSet(ex.exerciseId);
            }}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-xs font-semibold whitespace-nowrap transition-colors hover:bg-[var(--surface-elev)]"
            style={{
              borderColor: 'var(--border-strong)',
              color: 'var(--ink-secondary)',
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>세트 추가</span>
          </button>
        </div>
      )}
    </article>
  );
}
