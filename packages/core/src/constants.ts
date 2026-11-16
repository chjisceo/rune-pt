import type { MuscleGroupId, RoutineMode } from './types';

export const TIERS = [
  '아이언',
  '브론즈',
  '실버',
  '골드',
  '플래티넘',
  '에메랄드',
  '다이아몬드',
  '마스터',
  '그랜드마스터',
  '챌린저',
] as const;

export const TIER_RANK_HINT: readonly string[] = [
  '운동을 시작한 단계',
  '기초 체력 형성 · 일반 성인 상위 50%',
  '헬스 이용자 상위 80% · 성인 상위 43%',
  '헬스 이용자 상위 65% · 성인 상위 32%',
  '헬스 이용자 상위 50% · 성인 상위 20%',
  '헬스 이용자 상위 40% · 성인 상위 10%',
  '헬스 이용자 상위 30% · 성인 상위 6%',
  '헬스 이용자 상위 20% · 성인 상위 3%',
  '헬스 이용자 상위 7% · 성인 상위 0.5%',
  '헬스 이용자 상위 3% · 성인 상위 0.1%',
];

export const TIER_COLORS: readonly string[] = [
  '#7c8798',
  '#b87349',
  '#9cb2c9',
  '#e2b659',
  '#4ad4e6',
  '#3bb56a',
  '#5aa9ff',
  '#a678f5',
  '#f06a54',
  '#ffd166',
];

export const STAR_WIDTH_MP = [
  220, 420, 730, 1430, 2240, 3390, 4730, 8400, 11760, 15680,
] as const;

export const MUSCLE_META: Record<
  MuscleGroupId,
  { label: string; colorDark: string; colorLight: string }
> = {
  chest: { label: '가슴', colorDark: '#f06a54', colorLight: '#d94c38' },
  back: { label: '등', colorDark: '#4ad4e6', colorLight: '#0b7e93' },
  leg: { label: '하체', colorDark: '#e2b659', colorLight: '#7d5710' },
  shoulder: { label: '어깨', colorDark: '#a678f5', colorLight: '#6d4aff' },
  arm: { label: '팔', colorDark: '#3bb56a', colorLight: '#228b4d' },
  core: { label: '코어', colorDark: '#ec5fa7', colorLight: '#c2367c' },
};

export const ROUTINE_MODES: Record<
  RoutineMode,
  { name: string; summary: string; defaultReps: number[] }
> = {
  volume: {
    name: '볼륨형',
    summary: '5회×2 · 10회×2 · 15회 · 20회 구성',
    defaultReps: [5, 5, 10, 10, 15],
  },
  strength: {
    name: '스트렝스 강화형',
    summary: '5회 이하 3세트 + 8회 3세트',
    defaultReps: [5, 5, 5, 8],
  },
  low: {
    name: '로우컨디션형',
    summary: '15RM 무게로 10회 × 3세트, 관절 부담 최소화',
    defaultReps: [10, 10, 10],
  },
};

export const SAFETY_ATTRIBUTION = {
  glbLicense: 'BodyParts3D © DBCLS (CC BY 4.0)',
  medicalNotice: '운동 강도 및 해부 시각화는 비의료 참고용 정보이며, 통증 시 즉시 중지하세요.',
  glbSizeMb: 4.97,
  glbTrianglesLabel: '99만 삼각형 (Draco 무손실 경량화)',
} as const;
