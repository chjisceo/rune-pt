import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Award,
  Calendar,
  Dumbbell,
  ExternalLink,
  Gift,
  LogOut,
  Moon,
  Shield,
  Sliders,
  Sun,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  ROUTINE_MODES,
  SAMPLE_PYRAMID,
  SAMPLE_RADAR_30D,
  TIERS,
  calculateSessionVolume,
  clampAge,
} from '@rune-pt/core';
import type {
  CalendarDayRecord,
  GiftItem,
  MemberProfile,
  RoutineMode,
  ThemeMode,
  TrainerMemberSummary,
  UserRole,
  WorkoutExerciseLog,
  WorkoutSetRow,
} from '@rune-pt/core';
import { AvatarView } from './components/AvatarView';
import { LoginScreen, OnboardingWizard } from './components/AuthOnboardingView';
import { BrandLogo } from './components/BrandLogo';
import { CalendarStatsView } from './components/CalendarStatsView';
import { GiftsAccountView } from './components/GiftsAccountView';
import { TrainerView } from './components/TrainerView';
import { WorkoutView } from './components/WorkoutView';
import { runeRepository } from './services/localRuneRepository';
import {
  attemptAutoKakaoRedirect,
  isIosDevice,
  isKakaoTalkInApp,
  openExternalFromKakao,
} from './utils/kakaoRedirect';

type AppTab =
  | 'workout'
  | 'calendar'
  | 'stats'
  | 'avatar'
  | 'gifts'
  | 'account'
  | 'trainer';

type ScreenGate = 'app' | 'login' | 'onboarding';

const MEMBER_NAV: readonly {
  id: AppTab;
  label: string;
  mobileLabel: string;
  icon: typeof Dumbbell;
}[] = [
  { id: 'workout', label: '오늘 운동', mobileLabel: '오늘', icon: Dumbbell },
  { id: 'calendar', label: '기록 · 통계', mobileLabel: '기록', icon: Calendar },
  { id: 'avatar', label: '아바타 상태창', mobileLabel: '아바타', icon: Shield },
  { id: 'gifts', label: '선물함', mobileLabel: '선물', icon: Gift },
  { id: 'account', label: '체성분 · 희망티어', mobileLabel: '내 정보', icon: Sliders },
];

function currentTimeLabel(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `저장됨 · ${hh}:${mm}`;
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'dark';
    const q = new URLSearchParams(window.location.search).get('theme');
    return q === 'light' ? 'light' : 'dark';
  });

  const [gate, setGate] = useState<ScreenGate>(() => {
    if (typeof window === 'undefined') return 'app';
    const q = new URLSearchParams(window.location.search).get('view');
    if (q === 'login' || q === 'onboarding') return q;
    return 'app';
  });

  const [role, setRole] = useState<UserRole>(() => {
    if (typeof window === 'undefined') return 'member';
    const q = new URLSearchParams(window.location.search).get('view');
    return q === 'trainer' ? 'trainer' : 'member';
  });

  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    if (typeof window === 'undefined') return 'workout';
    const q = new URLSearchParams(window.location.search).get('view');
    if (
      q === 'workout' ||
      q === 'calendar' ||
      q === 'stats' ||
      q === 'avatar' ||
      q === 'gifts' ||
      q === 'account' ||
      q === 'trainer'
    ) {
      return q;
    }
    return 'workout';
  });

  const [initialSnapshot] = useState(() => runeRepository.loadSnapshot());
  const [member, setMember] = useState<MemberProfile>(initialSnapshot.member);
  const [mode, setMode] = useState<RoutineMode>(initialSnapshot.mode);
  const [trailOrderEnabled, setTrailOrderEnabled] = useState(
    initialSnapshot.trailOrderEnabled,
  );
  const [exercises, setExercises] = useState<WorkoutExerciseLog[]>(
    initialSnapshot.exercises,
  );
  const [tierProgress, setTierProgress] = useState(initialSnapshot.tierProgress);
  const [gifts, setGifts] = useState<GiftItem[]>(initialSnapshot.gifts);
  const [records, setRecords] = useState<CalendarDayRecord[]>(initialSnapshot.records);
  const [trainerMembers, setTrainerMembers] = useState<TrainerMemberSummary[]>(
    initialSnapshot.trainerMembers,
  );
  const [savedAtLabel, setSavedAtLabel] = useState(initialSnapshot.savedAtLabel);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showKakaoBanner, setShowKakaoBanner] = useState<boolean>(() =>
    isKakaoTalkInApp(),
  );

  useEffect(() => {
    runeRepository.saveSnapshot({
      member,
      mode,
      trailOrderEnabled,
      exercises,
      tierProgress,
      gifts,
      records,
      trainerMembers,
      savedAtLabel,
    });
  }, [
    member,
    mode,
    trailOrderEnabled,
    exercises,
    tierProgress,
    gifts,
    records,
    trainerMembers,
    savedAtLabel,
  ]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.has('code') || params.has('access_token')) {
      params.delete('code');
      params.delete('access_token');
      const next = params.toString();
      const cleaned = `${window.location.pathname}${next ? `?${next}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', cleaned);
    }
    attemptAutoKakaoRedirect();
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const id = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(id);
  }, [toastMessage]);

  const unreadGiftCount = useMemo(
    () => gifts.filter((g) => !g.claimed).length,
    [gifts],
  );

  const overallTier = useMemo(() => {
    if (tierProgress.length === 0) return { tierIndex: 0, stars: 0, badge: 'I0' };
    const totalTier = tierProgress.reduce((acc, item) => acc + item.tierIndex, 0);
    const totalStars = tierProgress.reduce((acc, item) => acc + item.stars, 0);
    const tierIndex = Math.round(totalTier / tierProgress.length);
    const stars = Math.round(totalStars / tierProgress.length);
    const tierShort = ['I', 'B', 'S', 'G', 'P', 'E', 'D', 'M', 'GM', 'C'][tierIndex] ?? 'T';
    return { tierIndex, stars, badge: `${tierShort}${stars}` };
  }, [tierProgress]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleRoleSwitch = (nextRole: UserRole) => {
    setRole(nextRole);
    if (nextRole === 'trainer') {
      setActiveTab('trainer');
    } else if (activeTab === 'trainer') {
      setActiveTab('workout');
    }
  };

  const handleChangeMode = (nextMode: RoutineMode) => {
    setMode(nextMode);
    const presetReps = ROUTINE_MODES[nextMode].defaultReps;
    setExercises((prev) =>
      prev.map((ex, idx) => {
        if (idx > 0) return ex;
        const baseKg = nextMode === 'low' ? Math.round(ex.estimated1RmKg * 0.6) : 80;
        return {
          ...ex,
          sets: ex.sets.map((s, sIdx) =>
            s.tag === 'W'
              ? s
              : {
                  ...s,
                  kg: baseKg,
                  reps: presetReps[Math.min(sIdx, presetReps.length - 1)] ?? s.reps,
                },
          ),
        };
      }),
    );
    setToastMessage(`${ROUTINE_MODES[nextMode].name} 목표 범위로 조정했습니다`);
  };

  const handleUpdateSet = (exId: string, setId: string, patch: Partial<WorkoutSetRow>) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.exerciseId !== exId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
        };
      }),
    );
  };

  const handleAddSet = (exId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.exerciseId !== exId) return ex;
        const last = ex.sets[ex.sets.length - 1];
        const nextSet: WorkoutSetRow = {
          id: `${exId}-${Date.now().toString(36)}-${ex.sets.length}`,
          tag: 'M',
          prevLabel: last ? `${last.kg} × ${last.reps}` : '신규',
          kg: last ? last.kg : 20,
          reps: last ? last.reps : 10,
          done: false,
        };
        return { ...ex, sets: [...ex.sets, nextSet] };
      }),
    );
  };

  const handleSaveSession = () => {
    let totalVolumeKg = 0;
    let totalCompleted = 0;
    const muscles = Array.from(new Set(exercises.map((e) => e.muscle)));

    for (const ex of exercises) {
      const calc = calculateSessionVolume(ex.sets, ex.estimated1RmKg);
      totalVolumeKg += calc.rawVolumeKg;
      totalCompleted += calc.completedCount;
    }

    const todayStr = '2026-11-14';
    setRecords((prev) => {
      const existing = prev.find((r) => r.date === todayStr);
      const nextRec: CalendarDayRecord = {
        date: todayStr,
        mode,
        muscles,
        volumeKg: Math.max(totalVolumeKg, 1200),
        completedSets: totalCompleted,
        note: `${ROUTINE_MODES[mode].name} 루틴 저장`,
      };
      return existing
        ? prev.map((r) => (r.date === todayStr ? nextRec : r))
        : [...prev, nextRec];
    });
    setSavedAtLabel(currentTimeLabel());
    setToastMessage(`오늘 운동 ${totalVolumeKg.toLocaleString('ko-KR')}kg 저장 완료`);
  };

  const handleClaimGift = (giftId: string) => {
    setGifts((prev) =>
      prev.map((g) => (g.id === giftId ? { ...g, claimed: true } : g)),
    );
    setToastMessage('선물을 수령하고 오늘 루틴 상태에 반영했습니다');
  };

  const handleUpdateMember = (patch: Partial<MemberProfile>) => {
    setMember((prev) => ({
      ...prev,
      ...patch,
      age: patch.age !== undefined ? clampAge(patch.age) : prev.age,
    }));
    setToastMessage('신체·목표 설정이 저장되었습니다');
  };

  const handleApproveQuest = (memberId: string) => {
    setTrainerMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              pendingQuest: undefined,
              stars: Math.min(8, m.stars + 1),
              trainerComment: `${m.trainerComment} (승급 퀘스트 확인 완료)`,
            }
          : m,
      ),
    );
    if (memberId === member.id) {
      setTierProgress((prev) =>
        prev.map((item, idx) =>
          idx === 0 ? { ...item, stars: Math.min(8, item.stars + 1) } : item,
        ),
      );
    }
    setToastMessage('승급 퀘스트를 승인했습니다');
  };

  const handleSendGift = (memberId: string, title: string, message: string) => {
    const newGift: GiftItem = {
      id: `gift-${Date.now()}`,
      title,
      fromTrainer: '박도현 코치',
      kind: 'routine-note',
      message,
      receivedAt: '방금 전',
      claimed: false,
    };
    if (memberId === member.id) {
      setGifts((prev) => [newGift, ...prev]);
    }
    setToastMessage('회원 선물함으로 루틴 노트를 전송했습니다');
  };

  if (gate === 'login') {
    return (
      <LoginScreen
        theme={theme}
        onToggleTheme={toggleTheme}
        onLoginDemo={(chosenRole) => {
          setRole(chosenRole);
          setActiveTab(chosenRole === 'trainer' ? 'trainer' : 'workout');
          setGate('app');
        }}
        onStartOnboarding={() => setGate('onboarding')}
      />
    );
  }

  if (gate === 'onboarding') {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
        <OnboardingWizard
          initialMember={member}
          onComplete={(updated) => {
            setMember(updated);
            setRole('member');
            setActiveTab('workout');
            setGate('app');
            setToastMessage(`${updated.name} 회원 온보딩 설정을 반영했습니다`);
          }}
          onCancel={() => setGate('app')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col lg:flex-row">
      {/* Desktop 232px Sidebar */}
      <aside className="hidden lg:flex lg:w-[232px] lg:shrink-0 lg:flex-col lg:justify-between bg-[var(--surface)] border-r border-[var(--border)] px-4 py-5 sticky top-0 h-screen">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
            <BrandLogo
              variant="sidebar"
              subtitle={`${member.name} · ${TIERS[overallTier.tierIndex]}`}
            />
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="테마 전환"
              className="w-8 h-8 rounded-lg border border-[var(--border)] bg-[var(--surface-elev)] flex items-center justify-center text-[var(--ink-secondary)] hover:text-[var(--ink)] cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div
            className="mt-4 grid grid-cols-2 p-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs"
            role="tablist"
            aria-label="역할 전환"
          >
            <button
              type="button"
              onClick={() => handleRoleSwitch('member')}
              className={`py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                role === 'member'
                  ? 'bg-[var(--surface-elev)] text-[var(--gold)]'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              회원 뷰
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch('trainer')}
              className={`py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                role === 'trainer'
                  ? 'bg-[var(--surface-elev)] text-[var(--cyan)]'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              트레이너
            </button>
          </div>

          <nav className="mt-5 flex flex-col gap-1" aria-label="주 메뉴">
            {role === 'trainer' ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('trainer')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer ${
                    activeTab === 'trainer'
                      ? 'bg-[var(--cyan-soft)] text-[var(--ink)] border border-[var(--cyan)]/40 font-semibold'
                      : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-elev)]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-[var(--cyan)]" />
                    담당 회원 관리
                  </span>
                  <span className="mono-num text-xs px-1.5 py-0.5 rounded bg-[var(--surface-elev)]">
                    {trainerMembers.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole('member');
                    setActiveTab('workout');
                  }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-elev)] cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Dumbbell className="w-4 h-4" />
                    회원 루틴 미리보기
                  </span>
                </button>
              </>
            ) : (
              MEMBER_NAV.map((item) => {
                const Icon = item.icon;
                const active =
                  activeTab === item.id ||
                  (item.id === 'calendar' && activeTab === 'stats');
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors cursor-pointer ${
                      active
                        ? 'bg-[var(--cyan-soft)] text-[var(--ink)] border border-[var(--cyan)]/40 font-semibold'
                        : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-elev)] font-medium'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          active ? 'text-[var(--cyan)]' : 'text-[var(--muted)]'
                        }`}
                      />
                      {item.label}
                    </span>
                    {item.id === 'gifts' && unreadGiftCount > 0 && (
                      <span
                        className="mono-num text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: 'var(--gold)',
                          color: 'var(--gold-ink)',
                        }}
                      >
                        {unreadGiftCount}
                      </span>
                    )}
                    {item.id === 'avatar' && (
                      <span className="mono-num text-[11px] text-[var(--hud-blue)]">
                        {overallTier.badge}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </nav>
        </div>

        <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-2 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[var(--ok)]" />
            <span>{savedAtLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => setGate('onboarding')}
              className="flex items-center gap-1.5 text-[var(--ink-secondary)] hover:text-[var(--cyan)] cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
              온보딩 미리보기
            </button>
            <button
              type="button"
              onClick={() => setGate('login')}
              className="flex items-center gap-1 text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              로그인
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar (< 1024px) */}
      <header className="lg:hidden sticky top-0 z-30 bg-[var(--surface)] border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <BrandLogo variant="mobile" subtitle={`${member.name} · ${savedAtLabel}`} />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              handleRoleSwitch(role === 'member' ? 'trainer' : 'member')
            }
            className="min-h-[40px] px-3 rounded-lg border border-[var(--border)] bg-[var(--surface-elev)] text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap"
          >
            {role === 'member' ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-[var(--cyan)]" />
                회원
              </>
            ) : (
              <>
                <Award className="w-3.5 h-3.5 text-[var(--gold)]" />
                트레이너
              </>
            )}
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="테마 전환"
            className="w-10 h-10 rounded-lg border border-[var(--border)] bg-[var(--surface-elev)] flex items-center justify-center"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 px-4 py-5 pb-24 lg:px-7 lg:py-6 lg:pb-8">
        {showKakaoBanner && (
          <div
            role="region"
            aria-label="카카오톡 외부 브라우저 전환 안내"
            className="surface-card mb-4 px-4 py-3 border-[var(--cyan)]/40 bg-[var(--cyan-soft)] flex flex-wrap items-center justify-between gap-3"
          >
            <div className="space-y-0.5 text-sm">
              <p className="font-semibold text-[var(--ink)]">
                카카오톡 인앱 브라우저로 열렸습니다
              </p>
              <p className="text-xs text-[var(--ink-secondary)]">
                {isIosDevice() ? 'Safari' : 'Chrome'}에서 열면{' '}
                <span className="mono-num">3D</span> 근육 렌더링과 로그인 세션이
                더 안정적으로 동작해요.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openExternalFromKakao()}
                className="min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                style={{
                  backgroundColor: 'var(--cyan)',
                  color: 'var(--bg)',
                }}
              >
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isIosDevice() ? 'Safari로 열기' : 'Chrome으로 열기'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowKakaoBanner(false)}
                aria-label="외부 브라우저 안내 닫기"
                className="min-h-[40px] min-w-[40px] rounded-lg border border-[var(--border)] bg-[var(--surface-elev)] flex items-center justify-center text-[var(--ink-secondary)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'workout' && (
          <WorkoutView
            exercises={exercises}
            mode={mode}
            trailOrderEnabled={trailOrderEnabled}
            theme={theme}
            tierProgress={tierProgress}
            hopeTierIndex={member.hopeTierIndex}
            pyramid={SAMPLE_PYRAMID}
            savedAtLabel={savedAtLabel}
            onChangeMode={handleChangeMode}
            onToggleTrailOrder={() => setTrailOrderEnabled((v) => !v)}
            onUpdateSet={handleUpdateSet}
            onAddSet={handleAddSet}
            onSaveSession={handleSaveSession}
            onOpenAvatar={() => setActiveTab('avatar')}
          />
        )}

        {(activeTab === 'calendar' || activeTab === 'stats') && (
          <CalendarStatsView
            mode={activeTab}
            records={records}
            radar30d={SAMPLE_RADAR_30D}
            tierProgress={tierProgress}
            theme={theme}
            onSwitchTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'avatar' && (
          <AvatarView
            member={member}
            tierProgress={tierProgress}
            pyramid={SAMPLE_PYRAMID}
            theme={theme}
          />
        )}

        {(activeTab === 'gifts' || activeTab === 'account') && (
          <GiftsAccountView
            view={activeTab}
            gifts={gifts}
            member={member}
            onClaimGift={handleClaimGift}
            onUpdateMember={handleUpdateMember}
            onOpenOnboarding={() => setGate('onboarding')}
          />
        )}

        {activeTab === 'trainer' && (
          <TrainerView
            members={trainerMembers}
            onApproveQuest={handleApproveQuest}
            onSendGift={handleSendGift}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation (< 1024px) */}
      <nav
        aria-label="모바일 하단 메뉴"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--surface)] border-t border-[var(--border)] px-1.5 py-1.5 grid grid-cols-5 gap-1"
      >
        {(role === 'trainer'
          ? [
              { id: 'trainer' as AppTab, mobileLabel: '회원관리', icon: Users },
              { id: 'workout' as AppTab, mobileLabel: '운동뷰', icon: Dumbbell },
              { id: 'calendar' as AppTab, mobileLabel: '기록', icon: Calendar },
              { id: 'avatar' as AppTab, mobileLabel: '상태창', icon: Shield },
              { id: 'account' as AppTab, mobileLabel: '내 정보', icon: Sliders },
            ]
          : MEMBER_NAV
        ).map((item) => {
          const Icon = item.icon;
          const active =
            activeTab === item.id ||
            (item.id === 'calendar' && activeTab === 'stats');
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`min-h-[46px] rounded-lg flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium whitespace-nowrap relative ${
                active
                  ? 'text-[var(--cyan)] bg-[var(--cyan-soft)] font-semibold'
                  : 'text-[var(--muted)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.mobileLabel}</span>
              {item.id === 'gifts' && unreadGiftCount > 0 && (
                <span
                  className="mono-num absolute top-1 right-2.5 text-[9px] font-bold px-1 rounded-full"
                  style={{
                    backgroundColor: 'var(--gold)',
                    color: 'var(--gold-ink)',
                  }}
                >
                  {unreadGiftCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Non-blocking Toast */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-20 lg:bottom-6 right-5 z-50 px-4 py-2.5 rounded-lg border border-[var(--cyan)]/50 bg-[var(--surface-elev)] text-[var(--ink)] text-sm font-medium shadow-lg"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
