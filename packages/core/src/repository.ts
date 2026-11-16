import type {
  CalendarDayRecord,
  GiftItem,
  MemberProfile,
  RoutineMode,
  TierProgress,
  TrainerMemberSummary,
  WorkoutExerciseLog,
} from './types';

/**
 * 룬PT 앱이 저장/불러오기 하는 전체 상태 스냅샷입니다.
 * 로컬 저장소(localStorage)와 향후 Supabase DB 어댑터가 동일한 데이터 모양을 사용합니다.
 */
export interface RuneAppSnapshot {
  member: MemberProfile;
  mode: RoutineMode;
  trailOrderEnabled: boolean;
  exercises: WorkoutExerciseLog[];
  tierProgress: TierProgress[];
  gifts: GiftItem[];
  records: CalendarDayRecord[];
  trainerMembers: TrainerMemberSummary[];
  savedAtLabel: string;
}

/**
 * 데이터 저장소 교체용 공통 인터페이스 (Repository Pattern).
 * - 현재: apps/web/src/services/localRuneRepository.ts (브라우저 localStorage 저장)
 * - 추후: Supabase 연동 시 같은 인터페이스를 구현한 파일로 한 줄만 교체하면 됩니다.
 */
export interface RuneDataRepository {
  loadSnapshot: () => RuneAppSnapshot;
  saveSnapshot: (snapshot: RuneAppSnapshot) => void;
  resetSnapshot: () => RuneAppSnapshot;
}
