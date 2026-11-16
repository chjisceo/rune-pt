import { Pause, Play, RotateCcw, Timer } from 'lucide-react';

export function formatCountdown(sec: number): string {
  const clamped = Math.max(0, Math.floor(sec));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export interface RestTimerPillProps {
  restSeconds: number;
  defaultRestSeconds: number;
  timerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
}

/**
 * 데스크톱/상단 헤더용 휴식 타이머 필.
 */
export function RestTimerPill({
  restSeconds,
  defaultRestSeconds,
  timerRunning,
  onToggleTimer,
  onResetTimer,
}: RestTimerPillProps) {
  return (
    <div
      className="inline-flex items-center overflow-hidden rounded-full border"
      style={{
        backgroundColor: timerRunning ? 'var(--cyan-soft)' : 'var(--surface)',
        borderColor: timerRunning ? 'var(--cyan)' : 'var(--border-strong)',
      }}
    >
      <button
        type="button"
        onClick={onToggleTimer}
        aria-label={timerRunning ? '휴식 타이머 일시정지' : '휴식 타이머 시작'}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-colors"
        style={{
          color: timerRunning ? 'var(--cyan)' : 'var(--ink)',
        }}
      >
        <Timer className="h-3.5 w-3.5" />
        <span className="mono-num text-sm">{formatCountdown(restSeconds)}</span>
        {timerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      </button>
      {(timerRunning || restSeconds !== defaultRestSeconds) && (
        <button
          type="button"
          onClick={onResetTimer}
          aria-label="휴식 타이머 초기화"
          className="border-l px-2.5 py-2 transition-colors"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--muted)',
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export interface RestTimerBarProps {
  restSeconds: number;
  defaultRestSeconds: number;
  timerRunning: boolean;
  onAddSeconds: (delta: number) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
}

/**
 * 모바일(< 1024px) 엄지 조작 영역에 고정되는 자동 휴식 타이머 바.
 */
export function RestTimerBar({
  restSeconds,
  defaultRestSeconds,
  timerRunning,
  onAddSeconds,
  onToggleTimer,
  onResetTimer,
}: RestTimerBarProps) {
  if (!timerRunning && restSeconds === defaultRestSeconds) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="휴식 타이머 미니 컨트롤"
      className="lg:hidden fixed bottom-[64px] inset-x-3 z-20 surface-card px-3.5 py-2 flex items-center justify-between gap-2 shadow-lg"
      style={{ borderColor: 'var(--cyan)' }}
    >
      <div className="flex items-center gap-2 whitespace-nowrap">
        <Timer className="h-4 w-4 text-[var(--cyan)] shrink-0" />
        <span className="text-xs font-semibold text-[var(--ink-secondary)]">휴식</span>
        <span className="mono-num text-sm font-bold text-[var(--cyan)]">
          {formatCountdown(restSeconds)}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onAddSeconds(30)}
          className="mono-num min-h-[34px] rounded-md border px-2 text-xs font-semibold whitespace-nowrap"
          style={{
            backgroundColor: 'var(--surface-elev)',
            borderColor: 'var(--border)',
            color: 'var(--ink)',
          }}
        >
          +30초
        </button>
        <button
          type="button"
          onClick={onToggleTimer}
          aria-label={timerRunning ? '휴식 타이머 일시정지' : '휴식 타이머 재개'}
          className="min-h-[34px] min-w-[34px] rounded-md border flex items-center justify-center"
          style={{
            backgroundColor: 'var(--cyan-soft)',
            borderColor: 'var(--cyan)',
            color: 'var(--cyan)',
          }}
        >
          {timerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={onResetTimer}
          aria-label="휴식 타이머 초기화"
          className="min-h-[34px] min-w-[34px] rounded-md border flex items-center justify-center"
          style={{
            backgroundColor: 'var(--surface-elev)',
            borderColor: 'var(--border)',
            color: 'var(--muted)',
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
