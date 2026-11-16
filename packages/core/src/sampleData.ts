import type {
  CalendarDayRecord,
  GiftItem,
  MemberProfile,
  MuscleGroupId,
  PyramidStats,
  TierProgress,
  TrainerMemberSummary,
  WorkoutExerciseLog,
} from './types';

export const SAMPLE_MEMBER: MemberProfile = {
  id: 'mem-minjun',
  name: '김민준',
  age: 29,
  sex: 'M',
  heightCm: 176,
  bodyKg: 74.5,
  bodyFatPct: 14.8,
  expMonths: 18,
  interests: ['chest', 'back', 'shoulder'],
  injuries: ['우측 손목 과신전 주의'],
  hopeTierIndex: 6, // 다이아몬드
  run5kSec: 1580,
  trainerName: '박도현 코치',
};

export const INITIAL_TODAY_EXERCISES: WorkoutExerciseLog[] = [
  {
    exerciseId: 'bench',
    name: '벤치프레스',
    muscle: 'chest',
    subMuscles: '대흉근 중·하부 · 전면 삼각근 · 삼두',
    waypointOrder: 1,
    targetNote: '추정 1RM 102.5kg · 바벨 왕룬',
    estimated1RmKg: 102.5,
    sets: [
      { id: 'b-w', tag: 'W', prevLabel: '40 × 12', kg: 40, reps: 12, done: true },
      { id: 'b-1', tag: 'M', prevLabel: '80 × 8', kg: 80, reps: 8, done: true },
      { id: 'b-2', tag: 'M', prevLabel: '80 × 8', kg: 82.5, reps: 8, done: false },
      { id: 'b-3', tag: 'F', prevLabel: '80 × 7', kg: 82.5, reps: 7, done: false },
    ],
  },
  {
    exerciseId: 'incline-db',
    name: '인클라인 덤벨프레스',
    muscle: 'chest',
    subMuscles: '상부 가슴 · 전면 어깨',
    waypointOrder: 2,
    targetNote: '벤치 티어 연동 · 덤벨 각 28kg',
    estimated1RmKg: 74,
    sets: [
      { id: 'i-1', tag: 'M', prevLabel: '26 × 10', kg: 28, reps: 10, done: false },
      { id: 'i-2', tag: 'M', prevLabel: '26 × 10', kg: 28, reps: 10, done: false },
      { id: 'i-3', tag: 'F', prevLabel: '26 × 9', kg: 28, reps: 9, done: false },
    ],
  },
  {
    exerciseId: 'lat-raise',
    name: '사이드 레터럴 레이즈',
    muscle: 'shoulder',
    subMuscles: '측면 삼각근 · 승모 보조',
    waypointOrder: 3,
    targetNote: '반동 억제 15회 템포',
    estimated1RmKg: 21,
    sets: [
      { id: 'l-1', tag: 'M', prevLabel: '8 × 15', kg: 9, reps: 15, done: false },
      { id: 'l-2', tag: 'M', prevLabel: '8 × 15', kg: 9, reps: 15, done: false },
      { id: 'l-3', tag: 'F', prevLabel: '8 × 14', kg: 9, reps: 14, done: false },
    ],
  },
  {
    exerciseId: 'lying-tri',
    name: '라잉 트라이셉스 익스텐션',
    muscle: 'arm',
    subMuscles: '상완삼두근 장두·외측두',
    waypointOrder: 4,
    targetNote: '바벨 보조 · 팔꿈치 고정',
    estimated1RmKg: 48,
    sets: [
      { id: 't-1', tag: 'M', prevLabel: '30 × 12', kg: 32.5, reps: 12, done: false },
      { id: 't-2', tag: 'M', prevLabel: '30 × 12', kg: 32.5, reps: 12, done: false },
    ],
  },
];

export const INITIAL_TIER_PROGRESS: TierProgress[] = [
  { exerciseId: 'bench', exerciseName: '벤치프레스', muscle: 'chest', tierIndex: 4, stars: 4, mp: 5120, nextPromoMp: 7150, e1rmKg: 102.5, slot: '무기' },
  { exerciseId: 'squat', exerciseName: '스쿼트', muscle: 'leg', tierIndex: 3, stars: 6, mp: 4680, nextPromoMp: 5300, e1rmKg: 128, slot: '갑옷' },
  { exerciseId: 'deadlift', exerciseName: '데드리프트', muscle: 'back', tierIndex: 4, stars: 2, mp: 3920, nextPromoMp: 7150, e1rmKg: 155, slot: '망토' },
  { exerciseId: 'ohp', exerciseName: '오버헤드 프레스', muscle: 'shoulder', tierIndex: 3, stars: 3, mp: 3140, nextPromoMp: 4900, e1rmKg: 62, slot: '투구' },
  { exerciseId: 'bbcurl', exerciseName: '바벨 컬', muscle: 'arm', tierIndex: 3, stars: 5, mp: 4210, nextPromoMp: 4900, e1rmKg: 46, slot: '장갑' },
  { exerciseId: 'run5k', exerciseName: '5km 달리기', muscle: 'core', tierIndex: 3, stars: 2, mp: 2450, nextPromoMp: 4200, e1rmKg: 26, slot: '신발' },
];

export const SAMPLE_PYRAMID: PyramidStats = {
  foundation: 84,
  highland: 76,
  apex: 69,
};

export const SAMPLE_RADAR_30D: Record<MuscleGroupId, number> = {
  chest: 88,
  back: 79,
  leg: 72,
  shoulder: 81,
  arm: 74,
  core: 63,
};

export const INITIAL_GIFTS: GiftItem[] = [
  {
    id: 'gift-1',
    title: '벤치프레스 플래티넘 승급 시험권',
    fromTrainer: '박도현 코치',
    kind: 'tier-quest',
    message: '이번 주 82.5kg × 8회 깔끔히 통과하면 플래티넘 승급 시험이 열립니다.',
    receivedAt: '오늘 07:40',
    claimed: false,
  },
  {
    id: 'gift-2',
    title: '손목 보호 스트레칭 루틴 & 컨디션 메모',
    fromTrainer: '박도현 코치',
    kind: 'recovery-buff',
    message: '본세트 진입 전 전완근 이완 90초 체크해 주세요.',
    receivedAt: '어제 21:15',
    claimed: false,
  },
  {
    id: 'gift-3',
    title: '하체 스쿼트 125kg 돌파 축하 보너스 MP',
    fromTrainer: '박도현 코치',
    kind: 'routine-note',
    message: '자세 흔들림 없이 5회 완료 확인했습니다 (+320 MP).',
    receivedAt: '3일 전',
    claimed: true,
  },
];

export const SAMPLE_CALENDAR_RECORDS: CalendarDayRecord[] = [
  { date: '2026-11-02', mode: 'volume', muscles: ['chest', 'shoulder'], volumeKg: 5420, completedSets: 14 },
  { date: '2026-11-04', mode: 'strength', muscles: ['leg', 'core'], volumeKg: 6890, completedSets: 12 },
  { date: '2026-11-06', mode: 'volume', muscles: ['back', 'arm'], volumeKg: 5110, completedSets: 15 },
  { date: '2026-11-08', mode: 'low', muscles: ['chest', 'back'], volumeKg: 2940, completedSets: 9, note: '수면 부족으로 저부하 진행' },
  { date: '2026-11-10', mode: 'strength', muscles: ['leg', 'shoulder'], volumeKg: 7150, completedSets: 13 },
  { date: '2026-11-12', mode: 'volume', muscles: ['back', 'arm', 'core'], volumeKg: 5630, completedSets: 16 },
];

export const SAMPLE_TRAINER_MEMBERS: TrainerMemberSummary[] = [
  {
    id: 'mem-minjun',
    name: '김민준',
    tierIndex: 4,
    stars: 4,
    lastActive: '방금 운동 중',
    weeklySessions: 4,
    pendingQuest: '벤치프레스 82.5kg 승급 확인 대기',
    trainerComment: '바벨 내릴 때 우측 손목 중립 유지 확인 필요',
  },
  {
    id: 'mem-seoyeon',
    name: '이서연',
    tierIndex: 3,
    stars: 6,
    lastActive: '어제 19:40',
    weeklySessions: 3,
    pendingQuest: '스쿼트 85kg 승급 퀘스트',
    trainerComment: '무릎 안쪽 말림 거의 교정됨',
  },
  {
    id: 'mem-junho',
    name: '박준호',
    tierIndex: 2,
    stars: 3,
    lastActive: '5일 전',
    weeklySessions: 1,
    riskFlag: '출석 공백 5일 · 로우컨디션 권장',
    trainerComment: '야근 주간이라 30분 순환 루틴으로 선물 발송 예정',
  },
];
