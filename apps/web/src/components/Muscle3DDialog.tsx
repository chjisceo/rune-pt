import { useEffect, useId, useState } from 'react';
import {
  Bone,
  Box,
  Eye,
  Info,
  Layers,
  RotateCcw,
  ShieldAlert,
  X,
} from 'lucide-react';
import { MUSCLE_META, SAFETY_ATTRIBUTION } from '@rune-pt/core';
import type { MuscleGroupId, ThemeMode } from '@rune-pt/core';
import {
  MuscleCanvas3D,
  type AnatomyCameraPreset,
} from './MuscleCanvas3D';

export interface Muscle3DDialogProps {
  open: boolean;
  onClose: () => void;
  highlightedMuscles: MuscleGroupId[];
  primaryExerciseName: string;
  theme: ThemeMode;
}

export function Muscle3DDialog({
  open,
  onClose,
  highlightedMuscles,
  primaryExerciseName,
  theme,
}: Muscle3DDialogProps) {
  const titleId = useId();
  const [preset, setPreset] = useState<AnatomyCameraPreset>('front');
  const [presetTrigger, setPresetTrigger] = useState<number>(0);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [dimUnselected, setDimUnselected] = useState<boolean>(true);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const selectPreset = (next: AnatomyCameraPreset) => {
    setPreset(next);
    setPresetTrigger((n) => n + 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-xs sm:p-5"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="surface-card animate-modal-in flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden shadow-2xl"
      >
        <div
          className="flex items-center justify-between border-b px-5 py-3.5"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border"
              style={{
                backgroundColor: 'var(--cyan-soft)',
                borderColor: 'var(--cyan)',
                color: 'var(--cyan)',
              }}
            >
              <Box className="h-4 w-4" />
            </span>
            <div>
              <h2
                id={titleId}
                className="text-base font-bold leading-tight"
                style={{ color: 'var(--ink)' }}
              >
                3D 해부 근육 뷰어 · {primaryExerciseName}
              </h2>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
                드래그로 360° 회전 · 스크롤/핀치로 확대 · 자극 부위 색상 강조
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="3D 뷰어 닫기"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors hover:opacity-90"
            style={{
              backgroundColor: 'var(--surface-elev)',
              borderColor: 'var(--border)',
              color: 'var(--ink)',
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3.5 overflow-y-auto p-4 sm:p-5">
          <div
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3.5 py-2 text-xs"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--border)',
              color: 'var(--ink-secondary)',
            }}
          >
            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--cyan)' }} />
              <span>
                BodyParts3D <span className="mono-num">696</span>개 해부 메시 ({SAFETY_ATTRIBUTION.glbSizeMb}MB 무손실 경량) · 개인 식별정보 미전송
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {highlightedMuscles.map((m) => {
                const color = isDark ? MUSCLE_META[m].colorDark : MUSCLE_META[m].colorLight;
                return (
                  <span
                    key={m}
                    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                    style={{
                      borderColor: color,
                      color,
                      backgroundColor: isDark ? 'rgba(16, 24, 38, 0.85)' : '#fffcf5',
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                    {MUSCLE_META[m].label}
                  </span>
                );
              })}
            </div>
          </div>

          <MuscleCanvas3D
            highlightedMuscles={highlightedMuscles}
            theme={theme}
            preset={preset}
            presetTrigger={presetTrigger}
            showSkeleton={showSkeleton}
            dimUnselected={dimUnselected}
            dragEnabled={true}
            heightPx={420}
            maxPixelRatio={2}
          />

          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div
              className="inline-flex rounded-lg border p-1"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border)',
              }}
            >
              {(
                [
                  { id: 'front', label: '전면' },
                  { id: 'quarter', label: '45° 측면' },
                  { id: 'back', label: '후면' },
                ] as const
              ).map((p) => {
                const active = preset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectPreset(p.id)}
                    className="min-h-[36px] rounded-md px-3 text-xs font-semibold whitespace-nowrap transition-colors"
                    style={{
                      backgroundColor: active ? 'var(--surface-elev)' : 'transparent',
                      color: active ? 'var(--cyan)' : 'var(--muted)',
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => selectPreset('front')}
                aria-label="시점 초기화"
                className="inline-flex min-h-[36px] items-center gap-1 rounded-md px-2.5 text-xs whitespace-nowrap text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>리셋</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setDimUnselected((v) => !v)}
                aria-pressed={dimUnselected}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: dimUnselected ? 'var(--cyan-soft)' : 'var(--surface-elev)',
                  borderColor: dimUnselected ? 'var(--cyan)' : 'var(--border)',
                  color: dimUnselected ? 'var(--cyan)' : 'var(--muted)',
                }}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>자극 부위만 강조</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSkeleton((v) => !v)}
                aria-pressed={showSkeleton}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: showSkeleton ? 'var(--surface-elev)' : 'var(--bg-subtle)',
                  borderColor: showSkeleton ? 'var(--gold)' : 'var(--border)',
                  color: showSkeleton ? 'var(--gold)' : 'var(--muted)',
                }}
              >
                <Bone className="h-3.5 w-3.5" />
                <span>골격 표시</span>
              </button>

              <div
                className="hidden sm:inline-flex min-h-[36px] items-center gap-1 rounded-lg border px-2.5 text-[11px]"
                style={{
                  backgroundColor: 'var(--surface-elev)',
                  borderColor: 'var(--border)',
                  color: 'var(--muted)',
                }}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>마우스 드래그 · 휠 줌</span>
              </div>
            </div>
          </div>

          <div
            className="flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-xs leading-relaxed"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--border)',
              color: 'var(--muted)',
            }}
          >
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--gold)' }} />
            <div>
              <div className="font-semibold" style={{ color: 'var(--ink-secondary)' }}>
                {SAFETY_ATTRIBUTION.glbLicense} · Human Atlas (CC BY 4.0)
              </div>
              <div>{SAFETY_ATTRIBUTION.medicalNotice}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Muscle3DDialog;
