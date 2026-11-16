export type ThemeMode = 'dark' | 'light';
export type UserRole = 'member' | 'trainer';
export type RoutineMode = 'volume' | 'strength' | 'low';
export type MuscleGroupId = 'chest' | 'back' | 'leg' | 'shoulder' | 'arm' | 'core';
export type SetTag = 'W' | 'M' | 'F';
export type SexCode = 'M' | 'F';

export interface MemberProfile {
  id: string;
  name: string;
  age: number; // 8 ~ 90
  sex: SexCode;
  heightCm: number; // 120 ~ 230
  bodyKg: number; // 25 ~ 250
  bodyFatPct?: number; // 3 ~ 60 optional
  expMonths: number;
  interests: MuscleGroupId[];
  injuries: string[];
  hopeTierIndex: number; // 0 ~ 9
  run5kSec: number;
  trainerName: string;
}

export interface ExerciseMeta {
  id: string;
  name: string;
  muscle: MuscleGroupId;
  subMuscles: string;
  kind: 'barbell' | 'dumbbell' | 'machine' | 'body' | 'run';
  role: 'head' | 'aux' | 'follower';
  maxTier: number;
  headId?: string;
}

export interface WorkoutSetRow {
  id: string;
  tag: SetTag;
  prevLabel: string;
  kg: number;
  reps: number;
  done: boolean;
}

export interface WorkoutExerciseLog {
  exerciseId: string;
  name: string;
  muscle: MuscleGroupId;
  subMuscles: string;
  waypointOrder: number;
  targetNote: string;
  estimated1RmKg: number;
  sets: WorkoutSetRow[];
}

export interface TierProgress {
  exerciseId: string;
  exerciseName: string;
  muscle: MuscleGroupId;
  tierIndex: number; // 0..9
  stars: number; // 0..8
  mp: number;
  nextPromoMp: number;
  e1rmKg: number;
  slot: '무기' | '갑옷' | '투구' | '장갑' | '신발' | '망토';
}

export interface PyramidStats {
  foundation: number; // 기반 (체력·부상예방·출석)
  highland: number; // 고지 (대근육·볼륨·밸런스)
  apex: number; // 정점 (1RM·티어·5km)
}

export interface GiftItem {
  id: string;
  title: string;
  fromTrainer: string;
  kind: 'tier-quest' | 'recovery-buff' | 'routine-note';
  message: string;
  receivedAt: string;
  claimed: boolean;
}

export interface CalendarDayRecord {
  date: string; // YYYY-MM-DD
  mode: RoutineMode;
  muscles: MuscleGroupId[];
  volumeKg: number;
  completedSets: number;
  note?: string;
}

export interface TrainerMemberSummary {
  id: string;
  name: string;
  tierIndex: number;
  stars: number;
  lastActive: string;
  weeklySessions: number;
  pendingQuest?: string;
  riskFlag?: string;
  trainerComment: string;
}
