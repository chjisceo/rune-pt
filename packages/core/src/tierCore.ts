import { STAR_WIDTH_MP, TIERS } from './constants';
import type { WorkoutSetRow } from './types';

/** Epley 공식 기반 추정 1RM (kg) */
export function estimate1Rm(kg: number, reps: number): number {
  if (kg <= 0 || reps <= 0) return 0;
  if (reps === 1) return Math.round(kg * 10) / 10;
  return Math.round(kg * (1 + reps / 30) * 10) / 10;
}

/** 완료된 본세트/마무리 세트 볼륨 합산 (워밍업 W 제외, ref1RM 50% 미만 제외, 85% 이상 1.3배) */
export function calculateSessionVolume(
  sets: WorkoutSetRow[],
  ref1RmKg?: number,
): { rawVolumeKg: number; weightedMp: number; completedCount: number } {
  let rawVolumeKg = 0;
  let weightedMp = 0;
  let completedCount = 0;

  for (const s of sets) {
    if (!s.done) continue;
    completedCount += 1;
    if (s.tag === 'W') continue;
    const vol = Math.max(0, s.kg) * Math.max(0, s.reps);
    rawVolumeKg += vol;
    if (!ref1RmKg || ref1RmKg <= 0) {
      weightedMp += vol;
      continue;
    }
    const pct = s.kg / ref1RmKg;
    if (pct < 0.5) continue;
    weightedMp += pct >= 0.85 ? vol * 1.3 : vol;
  }

  return {
    rawVolumeKg: Math.round(rawVolumeKg),
    weightedMp: Math.round(weightedMp),
    completedCount,
  };
}

export function clampAge(age: number): number {
  if (!Number.isFinite(age)) return 28;
  return Math.max(8, Math.min(90, Math.round(age)));
}

export function ageTierCap(age: number): number {
  if (age <= 12) return 5; // 에메랄드
  if (age <= 15) return 6; // 다이아몬드
  if (age <= 17) return 7; // 마스터
  return 9;
}

export function formatTierBadge(tierIndex: number, stars: number): string {
  const safeTier = Math.max(0, Math.min(TIERS.length - 1, tierIndex));
  const clampedStars = Math.max(0, Math.min(8, stars));
  return `${TIERS[safeTier]} · ${clampedStars}성`;
}

export function starProgressPct(mpInTier: number, tierIndex: number): number {
  const safeIdx = Math.max(0, Math.min(STAR_WIDTH_MP.length - 1, tierIndex));
  const promoTarget = STAR_WIDTH_MP[safeIdx] * 5;
  if (promoTarget <= 0) return 100;
  return Math.max(4, Math.min(100, Math.round((mpInTier / promoTarget) * 100)));
}

/** HTML XSS 이스케이프 (Supabase/외부 문자열 출력 보호) */
export function escapeHtml(raw: string): string {
  return raw
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
