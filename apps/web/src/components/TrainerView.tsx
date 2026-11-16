import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  Send,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import { TIERS, TIER_COLORS, escapeHtml } from '@rune-pt/core';
import type { TrainerMemberSummary } from '@rune-pt/core';

export interface TrainerViewProps {
  members: TrainerMemberSummary[];
  onApproveQuest: (memberId: string) => void;
  onSendGift: (memberId: string, title: string, message: string) => void;
}

type MemberFilter = 'all' | 'pending' | 'risk';

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cyan)]';

const GIFT_PRESETS = [
  {
    label: '로우컨디션 순환 루틴',
    title: '30분 로우컨디션 회복 루틴',
    message: '피로도가 높은 주간에는 15RM 기준 10회 × 3세트로 관절 부담 없이 리듬만 유지해 주세요.',
  },
  {
    label: '승급 시험 전 폼 체크',
    title: '승급 시험 대비 폼 체크 메모',
    message: '본세트 진입 전 워밍업 1세트를 천천히 통제하며 가동범위와 호흡을 먼저 고정해 보세요.',
  },
  {
    label: '주간 출석 격려',
    title: '이번 주 출석 & 볼륨 피드백',
    message: '꾸준히 루틴을 이어가고 계셔요. 다음 수업 때 목표 중량 상향 여부를 같이 점검해요.',
  },
] as const;

function TierStarsDisplay({
  tierIndex,
  stars,
}: {
  tierIndex: number;
  stars: number;
}) {
  const safeTier = Math.max(0, Math.min(TIERS.length - 1, tierIndex));
  const safeStars = Math.max(0, Math.min(8, stars));
  const tierColor = TIER_COLORS[safeTier];
  const visibleStars = Math.min(5, safeStars);

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--surface-elev)] text-xs font-semibold whitespace-nowrap text-[var(--ink)]">
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: tierColor }}
      />
      <span>{TIERS[safeTier]}</span>
      <span className="inline-flex items-center gap-0.5 text-[var(--gold)]">
        {Array.from({ length: visibleStars }).map((_, idx) => (
          <Star key={idx} className="w-3 h-3 fill-current" aria-hidden="true" />
        ))}
      </span>
      <span className="mono-num text-[var(--ink-secondary)]">{safeStars}성</span>
    </span>
  );
}

export function TrainerView({
  members,
  onApproveQuest,
  onSendGift,
}: TrainerViewProps) {
  const [filter, setFilter] = useState<MemberFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string>(members[0]?.id ?? '');

  const [giftTitle, setGiftTitle] = useState<string>('');
  const [giftMessage, setGiftMessage] = useState<string>('');
  const [dispatchNotice, setDispatchNotice] = useState<string | null>(null);

  const pendingCount = useMemo(
    () => members.filter((m) => Boolean(m.pendingQuest)).length,
    [members],
  );
  const riskCount = useMemo(
    () => members.filter((m) => Boolean(m.riskFlag)).length,
    [members],
  );

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return members.filter((member) => {
      if (filter === 'pending' && !member.pendingQuest) return false;
      if (filter === 'risk' && !member.riskFlag) return false;
      if (q && !member.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [members, filter, searchQuery]);

  useEffect(() => {
    if (filteredMembers.length === 0) return;
    if (!filteredMembers.some((m) => m.id === selectedId)) {
      setSelectedId(filteredMembers[0].id);
    }
  }, [filteredMembers, selectedId]);

  const selectedMember = useMemo(
    () =>
      filteredMembers.find((m) => m.id === selectedId) ??
      members.find((m) => m.id === selectedId) ??
      null,
    [filteredMembers, members, selectedId],
  );

  const trimmedTitle = giftTitle.trim();
  const trimmedMessage = giftMessage.trim();
  const sanitizedTitle = useMemo(() => escapeHtml(trimmedTitle), [trimmedTitle]);
  const sanitizedMessage = useMemo(
    () => escapeHtml(trimmedMessage),
    [trimmedMessage],
  );
  const canSendGift =
    Boolean(selectedMember) &&
    trimmedTitle.length > 0 &&
    trimmedMessage.length > 0;

  const handleGiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !canSendGift) return;
    onSendGift(selectedMember.id, sanitizedTitle, sanitizedMessage);
    setDispatchNotice(
      `${selectedMember.name} 회원 선물함으로 "${trimmedTitle}" 루틴을 발송했어요.`,
    );
    setGiftTitle('');
    setGiftMessage('');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink)]">
            트레이너 회원 관리 콘솔
          </h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            승급 퀘스트 확인, 출석 공백 점검, 선물함 루틴 발송을 한 화면에서 처리해요.
          </p>
        </div>
      </div>

      {/* Top Summary Strip */}
      <section
        aria-label="담당 회원 요약 지표"
        className="surface-card grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]"
      >
        <div className="px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
            <Users className="w-4 h-4 text-[var(--cyan)]" aria-hidden="true" />
            <span>담당 회원 수</span>
          </div>
          <div className="text-xl font-extrabold text-[var(--ink)]">
            <span className="mono-num">{members.length}</span>
            <span className="text-xs font-semibold text-[var(--muted)] ml-1">명</span>
          </div>
        </div>

        <div className="px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
            <Award className="w-4 h-4 text-[var(--gold)]" aria-hidden="true" />
            <span>승급 확인 대기</span>
          </div>
          <div className="text-xl font-extrabold text-[var(--ink)]">
            <span className="mono-num">{pendingCount}</span>
            <span className="text-xs font-semibold text-[var(--muted)] ml-1">건</span>
          </div>
        </div>

        <div className="px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
            <AlertTriangle className="w-4 h-4 text-[var(--warn)]" aria-hidden="true" />
            <span>출석 주의 회원</span>
          </div>
          <div className="text-xl font-extrabold text-[var(--ink)]">
            <span className="mono-num">{riskCount}</span>
            <span className="text-xs font-semibold text-[var(--muted)] ml-1">명</span>
          </div>
        </div>
      </section>

      {/* Member List + Detail Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <section
          aria-label="회원 목록"
          className="lg:col-span-5 surface-card p-4 space-y-3"
        >
          <div className="relative">
            <Search
              className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="회원 이름 검색"
              aria-label="회원 이름 검색"
              className={`w-full min-h-[42px] pl-9 pr-3 rounded-xl bg-[var(--surface-elev)] border border-[var(--border)] text-sm text-[var(--ink)] ${FOCUS_RING}`}
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'all', label: '전체', count: members.length },
                { id: 'pending', label: '승급 대기', count: pendingCount },
                { id: 'risk', label: '출석 주의', count: riskCount },
              ] as const
            ).map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`min-h-[40px] px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${FOCUS_RING} ${
                    active
                      ? 'border-[var(--cyan)] bg-[var(--cyan-soft)] text-[var(--ink)]'
                      : 'border-[var(--border)] bg-[var(--surface-elev)] text-[var(--ink-secondary)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="mono-num text-[var(--muted)]">{tab.count}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            {filteredMembers.length === 0 ? (
              <div className="surface-elev p-6 text-center text-sm text-[var(--muted)]">
                조건에 맞는 회원이 없어요.
              </div>
            ) : (
              filteredMembers.map((member) => {
                const isSelected = selectedMember?.id === member.id;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(member.id);
                      setDispatchNotice(null);
                    }}
                    className={`w-full min-h-[72px] p-3.5 rounded-xl border text-left transition-colors cursor-pointer space-y-2 ${FOCUS_RING} ${
                      isSelected
                        ? 'border-[var(--cyan)] bg-[var(--cyan-soft)]'
                        : 'border-[var(--border)] bg-[var(--surface-elev)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[var(--ink)]">
                        {member.name}
                      </span>
                      <TierStarsDisplay
                        tierIndex={member.tierIndex}
                        stars={member.stars}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{member.lastActive}</span>
                      </span>
                      <span>
                        주간 <span className="mono-num">{member.weeklySessions}</span>회
                      </span>
                    </div>

                    {(member.pendingQuest || member.riskFlag) && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {member.pendingQuest && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--surface)] border border-[var(--gold)]/40 text-[11px] font-semibold text-[var(--gold)]">
                            <Award className="w-3 h-3" aria-hidden="true" />
                            <span>승급 대기</span>
                          </span>
                        )}
                        {member.riskFlag && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--warn-soft)] text-[11px] font-semibold text-[var(--warn)]">
                            <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                            <span>출석 주의</span>
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section
          aria-label="선택한 회원 상세 관리"
          className="lg:col-span-7 surface-card p-5 sm:p-6 space-y-5"
        >
          {!selectedMember ? (
            <div className="py-12 text-center text-sm text-[var(--muted)]">
              왼쪽 목록에서 관리할 회원을 선택해 주세요.
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[var(--border)]">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-xl font-bold text-[var(--ink)]">
                      {selectedMember.name}
                    </h2>
                    <TierStarsDisplay
                      tierIndex={selectedMember.tierIndex}
                      stars={selectedMember.stars}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>최근 활동: {selectedMember.lastActive}</span>
                    </span>
                    <span>
                      주간 출석:{' '}
                      <strong className="mono-num text-[var(--ink)]">
                        {selectedMember.weeklySessions}
                      </strong>
                      회
                    </span>
                  </div>
                </div>
              </div>

              {selectedMember.riskFlag && (
                <div className="rounded-xl border border-[var(--warn)]/40 bg-[var(--warn-soft)] px-4 py-3 flex items-start gap-2.5 text-sm">
                  <AlertTriangle
                    className="w-4 h-4 text-[var(--warn)] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <div className="font-bold text-[var(--ink)]">출석 · 컨디션 주의</div>
                    <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
                      {selectedMember.riskFlag}
                    </p>
                  </div>
                </div>
              )}

              {/* Pending Promotion Quest */}
              <div className="surface-elev p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-1.5">
                    <ShieldCheck
                      className="w-4 h-4 text-[var(--gold)]"
                      aria-hidden="true"
                    />
                    <span>승급 퀘스트 확인</span>
                  </h3>
                </div>

                {selectedMember.pendingQuest ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-sm text-[var(--ink-secondary)]">
                      {selectedMember.pendingQuest}
                    </p>
                    <button
                      type="button"
                      onClick={() => onApproveQuest(selectedMember.id)}
                      style={{
                        backgroundColor: 'var(--ok)',
                        color: 'var(--ok-ink)',
                      }}
                      className={`min-h-[44px] px-4 rounded-xl hover:opacity-95 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${FOCUS_RING}`}
                    >
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      <span>승급 퀘스트 승인</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-[var(--muted)]">
                    현재 승인 대기 중인 승급 퀘스트가 없어요.
                  </p>
                )}
              </div>

              {/* Existing Trainer Note */}
              <div className="surface-elev p-4 space-y-1.5">
                <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[var(--cyan)]" aria-hidden="true" />
                  <span>최근 코치 메모</span>
                </h3>
                <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
                  {selectedMember.trainerComment}
                </p>
              </div>

              {/* Trainer Gift / Feedback Composer */}
              <form onSubmit={handleGiftSubmit} className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[var(--ink)]">
                    선물함으로 루틴/코멘트 발송
                  </h3>
                  <span className="text-[11px] text-[var(--muted)]">
                    안전 텍스트 검증 적용
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {GIFT_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setGiftTitle(preset.title);
                        setGiftMessage(preset.message);
                        setDispatchNotice(null);
                      }}
                      className={`min-h-[36px] px-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elev)] hover:border-[var(--border-strong)] text-xs font-medium text-[var(--ink-secondary)] cursor-pointer ${FOCUS_RING}`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[var(--ink-secondary)]">
                    선물 제목
                  </span>
                  <input
                    type="text"
                    value={giftTitle}
                    onChange={(e) => {
                      setGiftTitle(e.target.value);
                      setDispatchNotice(null);
                    }}
                    maxLength={80}
                    placeholder="예: 하체 80% 회복 루틴 + 무릎 정렬 메모"
                    className={`w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--surface-elev)] border border-[var(--border)] text-sm text-[var(--ink)] ${FOCUS_RING}`}
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[var(--ink-secondary)]">
                    코멘트 / 루틴 가이드
                  </span>
                  <textarea
                    rows={3}
                    value={giftMessage}
                    onChange={(e) => {
                      setGiftMessage(e.target.value);
                      setDispatchNotice(null);
                    }}
                    maxLength={400}
                    placeholder="회원 선물함에 전달될 코칭 메시지를 입력해 주세요."
                    className={`w-full p-3.5 rounded-xl bg-[var(--surface-elev)] border border-[var(--border)] text-sm text-[var(--ink)] resize-y ${FOCUS_RING}`}
                  />
                </label>

                {(trimmedTitle || trimmedMessage) && (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3.5 space-y-1">
                    <div className="text-[11px] font-semibold text-[var(--muted)]">
                      전송 미리보기
                    </div>
                    <div className="text-sm font-bold text-[var(--ink)]">
                      {trimmedTitle || '제목 미입력'}
                    </div>
                    <p className="text-xs text-[var(--ink-secondary)] whitespace-pre-wrap break-words">
                      {trimmedMessage || '내용 미입력'}
                    </p>
                  </div>
                )}

                {dispatchNotice && (
                  <div
                    role="status"
                    className="rounded-xl border border-[var(--ok)]/40 bg-[var(--ok-soft)] px-3.5 py-2.5 text-xs font-medium text-[var(--ink)]"
                  >
                    {dispatchNotice}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!canSendGift}
                    className={`min-h-[44px] px-5 rounded-xl font-bold text-sm flex items-center gap-2 transition-opacity ${FOCUS_RING} ${
                      canSendGift
                        ? 'bg-[var(--cyan)] text-[#071020] hover:opacity-95 cursor-pointer'
                        : 'bg-[var(--surface-elev)] text-[var(--muted)] border border-[var(--border)] cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" aria-hidden="true" />
                    <span>선물함으로 루틴/코멘트 발송</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
