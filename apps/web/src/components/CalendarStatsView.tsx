import { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Calendar,
  CheckCircle2,
  Dumbbell,
  Flame,
  Layers,
  Star,
  StickyNote,
  TrendingUp,
} from 'lucide-react';
import {
  MUSCLE_META,
  ROUTINE_MODES,
  TIER_COLORS,
  TIERS,
  starProgressPct,
} from '@rune-pt/core';
import type {
  CalendarDayRecord,
  MuscleGroupId,
  RoutineMode,
  ThemeMode,
  TierProgress,
} from '@rune-pt/core';

export interface CalendarStatsViewProps {
  mode: 'calendar' | 'stats';
  records: CalendarDayRecord[];
  radar30d: Record<MuscleGroupId, number>;
  tierProgress: TierProgress[];
  theme: ThemeMode;
  onSwitchTab: (tab: 'calendar' | 'stats') => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

const RADAR_AXES: readonly MuscleGroupId[] = [
  'chest',
  'back',
  'leg',
  'shoulder',
  'arm',
  'core',
];

const MODE_LABELS: Record<RoutineMode, { label: string; tone: 'cyan' | 'gold' | 'ok' }> = {
  volume: { label: '볼륨형', tone: 'cyan' },
  strength: { label: '스트렝스', tone: 'gold' },
  low: { label: '로우컨디션', tone: 'ok' },
};

function getMuscleColor(muscle: MuscleGroupId, theme: ThemeMode): string {
  const meta = MUSCLE_META[muscle];
  return theme === 'dark' ? meta.colorDark : meta.colorLight;
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.round((cx + radius * Math.cos(rad)) * 100) / 100,
    y: Math.round((cy + radius * Math.sin(rad)) * 100) / 100,
  };
}

export function CalendarStatsView({
  mode,
  records,
  radar30d,
  tierProgress,
  theme,
  onSwitchTab,
}: CalendarStatsViewProps) {
  const recordsByDate = useMemo(() => {
    const map = new Map<string, CalendarDayRecord>();
    for (const r of records) {
      map.set(r.date, r);
    }
    return map;
  }, [records]);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (records.length === 0) return '2026-11-12';
    return records[records.length - 1].date;
  });

  // November 2026 calendar matrix
  const calendarCells = useMemo(() => {
    const year = 2026;
    const monthIndex = 10; // 0-indexed -> November
    const firstWeekday = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const cells: Array<{ day: number | null; dateStr: string | null }> = [];

    for (let i = 0; i < firstWeekday; i++) {
      cells.push({ day: null, dateStr: null });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `2026-11-${String(day).padStart(2, '0')}`;
      cells.push({ day, dateStr });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: null, dateStr: null });
    }
    return cells;
  }, []);

  const kpiSummary = useMemo(() => {
    const totalSessions = records.length;
    const totalVolumeKg = records.reduce((sum, r) => sum + r.volumeKg, 0);
    const totalSets = records.reduce((sum, r) => sum + r.completedSets, 0);
    const avgVolumeKg =
      totalSessions > 0 ? Math.round(totalVolumeKg / totalSessions) : 0;

    let topMuscle: MuscleGroupId = 'chest';
    let topScore = -1;
    let scoreSum = 0;
    for (const m of RADAR_AXES) {
      const val = radar30d[m] ?? 0;
      scoreSum += val;
      if (val > topScore) {
        topScore = val;
        topMuscle = m;
      }
    }
    const avgRadar = Math.round(scoreSum / RADAR_AXES.length);

    return {
      totalSessions,
      totalVolumeKg,
      totalSets,
      avgVolumeKg,
      topMuscle,
      topScore,
      avgRadar,
    };
  }, [records, radar30d]);

  const selectedRecord = recordsByDate.get(selectedDate) ?? null;

  // Radar SVG geometry
  const radarGeometry = useMemo(() => {
    const cx = 180;
    const cy = 160;
    const maxR = 96;
    const rings = [25, 50, 75, 100];

    const ringPolygons = rings.map((pct) => {
      const r = (maxR * pct) / 100;
      const pts = RADAR_AXES.map((_, idx) => {
        const angle = -90 + idx * 60;
        const p = polarToCartesian(cx, cy, r, angle);
        return `${p.x},${p.y}`;
      }).join(' ');
      return { pct, pts };
    });

    const axes = RADAR_AXES.map((muscle, idx) => {
      const angle = -90 + idx * 60;
      const outer = polarToCartesian(cx, cy, maxR, angle);
      const labelPos = polarToCartesian(cx, cy, maxR + 28, angle);
      const score = Math.max(0, Math.min(100, radar30d[muscle] ?? 0));
      const dataPt = polarToCartesian(cx, cy, (maxR * score) / 100, angle);
      return {
        muscle,
        label: MUSCLE_META[muscle].label,
        color: getMuscleColor(muscle, theme),
        score,
        outer,
        labelPos,
        dataPt,
      };
    });

    const dataPolygonPoints = axes
      .map((a) => `${a.dataPt.x},${a.dataPt.y}`)
      .join(' ');

    return { cx, cy, ringPolygons, axes, dataPolygonPoints };
  }, [radar30d, theme]);

  return (
    <div className="space-y-5">
      {/* Header + Sub-view Switcher */}
      <div className="surface-card p-4 md:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {mode === 'calendar' ? (
            <Calendar className="w-5 h-5" style={{ color: 'var(--cyan)' }} />
          ) : (
            <BarChart3 className="w-5 h-5" style={{ color: 'var(--cyan)' }} />
          )}
          <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>
            {mode === 'calendar' ? '운동 달력' : '능력치 · 통계'}
          </h2>
        </div>

        <div
          className="inline-flex p-1 rounded-lg border"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border)',
          }}
          role="tablist"
          aria-label="달력 및 통계 보기 전환"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'calendar'}
            onClick={() => onSwitchTab('calendar')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
            style={{
              backgroundColor:
                mode === 'calendar' ? 'var(--surface-elev)' : 'transparent',
              color: mode === 'calendar' ? 'var(--ink)' : 'var(--muted)',
              boxShadow:
                mode === 'calendar' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>운동 달력</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === 'stats'}
            onClick={() => onSwitchTab('stats')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
            style={{
              backgroundColor:
                mode === 'stats' ? 'var(--surface-elev)' : 'transparent',
              color: mode === 'stats' ? 'var(--ink)' : 'var(--muted)',
              boxShadow:
                mode === 'stats' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>능력치 · 통계</span>
          </button>
        </div>
      </div>

      {mode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* November 2026 Calendar Grid */}
          <section className="lg:col-span-7 surface-card p-4 md:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3
                className="text-base font-bold"
                style={{ color: 'var(--ink)' }}
              >
                <span className="mono-num">2026</span>년{' '}
                <span className="mono-num">11</span>월 운동 기록
              </h3>

              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <span style={{ color: 'var(--muted)' }}>
                  출석{' '}
                  <strong
                    className="mono-num"
                    style={{ color: 'var(--ink)' }}
                  >
                    {kpiSummary.totalSessions}
                  </strong>
                  일
                </span>
                <span style={{ color: 'var(--muted)' }}>
                  누적{' '}
                  <strong
                    className="mono-num"
                    style={{ color: 'var(--cyan)' }}
                  >
                    {kpiSummary.totalVolumeKg.toLocaleString()} kg
                  </strong>
                </span>
              </div>
            </div>

            {/* Weekday Header */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {WEEKDAYS.map((day, idx) => (
                <div
                  key={day}
                  className="text-xs font-semibold py-1"
                  style={{
                    color:
                      idx === 0
                        ? 'var(--warn)'
                        : idx === 6
                          ? 'var(--cyan)'
                          : 'var(--muted)',
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Day Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarCells.map((cell, idx) => {
                if (!cell.day || !cell.dateStr) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="h-16 sm:h-[72px] rounded-lg opacity-30"
                      style={{ backgroundColor: 'var(--bg-subtle)' }}
                    />
                  );
                }

                const rec = recordsByDate.get(cell.dateStr);
                const isSelected = selectedDate === cell.dateStr;

                return (
                  <button
                    key={cell.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(cell.dateStr!)}
                    aria-pressed={isSelected}
                    className="h-16 sm:h-[72px] rounded-lg p-1.5 sm:p-2 flex flex-col justify-between text-left border transition-all cursor-pointer focus:outline-none"
                    style={{
                      backgroundColor: isSelected
                        ? 'var(--surface-elev)'
                        : rec
                          ? 'var(--bg-subtle)'
                          : 'var(--surface)',
                      borderColor: isSelected
                        ? 'var(--cyan)'
                        : rec
                          ? 'var(--border-strong)'
                          : 'var(--border)',
                      boxShadow: isSelected
                        ? '0 0 0 1px var(--cyan)'
                        : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className="mono-num text-xs font-bold tabular-nums"
                        style={{
                          color: isSelected
                            ? 'var(--cyan)'
                            : rec
                              ? 'var(--ink)'
                              : 'var(--muted)',
                        }}
                      >
                        {cell.day}
                      </span>
                      {rec && (
                        <CheckCircle2
                          className="w-3 h-3 shrink-0"
                          style={{ color: 'var(--ok)' }}
                        />
                      )}
                    </div>

                    {rec ? (
                      <div className="space-y-1 w-full">
                        <div className="flex flex-wrap items-center gap-1">
                          {rec.muscles.map((m) => (
                            <span
                              key={m}
                              className="w-2 h-2 rounded-full inline-block"
                              style={{
                                backgroundColor: getMuscleColor(m, theme),
                              }}
                              title={MUSCLE_META[m].label}
                            />
                          ))}
                        </div>
                        <div
                          className="mono-num text-[10px] font-semibold truncate"
                          style={{ color: 'var(--ink-secondary)' }}
                        >
                          {rec.volumeKg.toLocaleString()}kg
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                        -
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Muscle Dot Legend */}
            <div
              className="pt-3 border-t flex flex-wrap items-center gap-3"
              style={{ borderColor: 'var(--border)' }}
            >
              {RADAR_AXES.map((m) => (
                <div key={m} className="inline-flex items-center gap-1.5 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: getMuscleColor(m, theme) }}
                  />
                  <span style={{ color: 'var(--ink-secondary)' }}>
                    {MUSCLE_META[m].label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Selected Day Inspector */}
          <aside className="lg:col-span-5 space-y-4">
            <div className="surface-card p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3
                  className="text-base font-bold"
                  style={{ color: 'var(--ink)' }}
                >
                  선택일 상세 리포트
                </h3>
                <span
                  className="mono-num text-xs font-bold px-2.5 py-1 rounded-md border"
                  style={{
                    backgroundColor: 'var(--surface-elev)',
                    borderColor: 'var(--border-strong)',
                    color: 'var(--ink)',
                  }}
                >
                  {selectedDate}
                </span>
              </div>

              {selectedRecord ? (
                <div className="space-y-4">
                  {/* Mode Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor:
                          MODE_LABELS[selectedRecord.mode].tone === 'cyan'
                            ? 'var(--cyan-soft)'
                            : MODE_LABELS[selectedRecord.mode].tone === 'ok'
                              ? 'var(--ok-soft)'
                              : 'var(--bg-subtle)',
                        color:
                          MODE_LABELS[selectedRecord.mode].tone === 'cyan'
                            ? 'var(--cyan)'
                            : MODE_LABELS[selectedRecord.mode].tone === 'ok'
                              ? 'var(--ok)'
                              : 'var(--gold)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>{MODE_LABELS[selectedRecord.mode].label}</span>
                    </span>

                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {ROUTINE_MODES[selectedRecord.mode].name}
                    </span>
                  </div>

                  {/* Volume & Completed Sets */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="surface-elev p-3.5 space-y-1">
                      <div
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: 'var(--muted)' }}
                      >
                        <Dumbbell className="w-3.5 h-3.5" />
                        <span>총 볼륨</span>
                      </div>
                      <div
                        className="mono-num text-xl font-extrabold"
                        style={{ color: 'var(--ink)' }}
                      >
                        {selectedRecord.volumeKg.toLocaleString()} kg
                      </div>
                    </div>

                    <div className="surface-elev p-3.5 space-y-1">
                      <div
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: 'var(--muted)' }}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>완료 세트</span>
                      </div>
                      <div
                        className="mono-num text-xl font-extrabold"
                        style={{ color: 'var(--cyan)' }}
                      >
                        {selectedRecord.completedSets} 세트
                      </div>
                    </div>
                  </div>

                  {/* Muscles Trained */}
                  <div className="space-y-2">
                    <div
                      className="text-xs font-semibold"
                      style={{ color: 'var(--muted)' }}
                    >
                      수행 부위
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecord.muscles.map((m) => {
                        const color = getMuscleColor(m, theme);
                        return (
                          <span
                            key={m}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border"
                            style={{
                              borderColor: color,
                              color,
                              backgroundColor: 'var(--surface-elev)',
                            }}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            {MUSCLE_META[m].label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Memo */}
                  <div
                    className="rounded-lg p-3.5 border space-y-1.5"
                    style={{
                      backgroundColor: 'var(--bg-subtle)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <div
                      className="flex items-center gap-1.5 text-xs font-semibold"
                      style={{ color: 'var(--ink-secondary)' }}
                    >
                      <StickyNote
                        className="w-3.5 h-3.5"
                        style={{ color: 'var(--gold)' }}
                      />
                      <span>세션 메모</span>
                    </div>
                    <p
                      className="text-xs leading-relaxed m-0"
                      style={{ color: 'var(--ink-secondary)' }}
                    >
                      {selectedRecord.note ??
                        '부위별 목표 세트와 적정 템포를 안정적으로 완수했습니다.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className="rounded-lg p-5 border text-center space-y-2"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <Activity
                    className="w-6 h-6 mx-auto"
                    style={{ color: 'var(--muted)' }}
                  />
                  <div
                    className="text-sm font-semibold"
                    style={{ color: 'var(--ink)' }}
                  >
                    휴식 및 회복일
                  </div>
                  <p
                    className="text-xs m-0"
                    style={{ color: 'var(--muted)' }}
                  >
                    해당 날짜에는 완료된 운동 세션이 없습니다. 표식이 있는 날짜를
                    선택하면 상세 볼륨과 메모를 확인할 수 있습니다.
                  </p>
                </div>
              )}
            </div>

            {/* Monthly KPI Quick Card */}
            <div className="surface-card p-4 grid grid-cols-3 gap-2.5 text-center">
              <div className="surface-elev p-2.5">
                <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
                  완료 세션
                </div>
                <div
                  className="mono-num text-base font-bold mt-0.5"
                  style={{ color: 'var(--ink)' }}
                >
                  {kpiSummary.totalSessions}회
                </div>
              </div>
              <div className="surface-elev p-2.5">
                <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
                  총 세트
                </div>
                <div
                  className="mono-num text-base font-bold mt-0.5"
                  style={{ color: 'var(--ink)' }}
                >
                  {kpiSummary.totalSets}
                </div>
              </div>
              <div className="surface-elev p-2.5">
                <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
                  회당 평균
                </div>
                <div
                  className="mono-num text-base font-bold mt-0.5"
                  style={{ color: 'var(--cyan)' }}
                >
                  {kpiSummary.avgVolumeKg.toLocaleString()}kg
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        /* Stats View: 30-day 6-Axis Radar + KPIs + Exercise Tier Mastery */
        <div className="space-y-5">
          {/* 30-day Volume & Session KPIs */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="surface-card p-4 space-y-1">
              <div
                className="flex items-center gap-1.5 text-xs"
                style={{ color: 'var(--muted)' }}
              >
                <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--cyan)' }} />
                <span>
                  <span className="mono-num">30</span>일 운동 세션
                </span>
              </div>
              <div
                className="mono-num text-2xl font-extrabold"
                style={{ color: 'var(--ink)' }}
              >
                {kpiSummary.totalSessions}회
              </div>
            </div>

            <div className="surface-card p-4 space-y-1">
              <div
                className="flex items-center gap-1.5 text-xs"
                style={{ color: 'var(--muted)' }}
              >
                <Dumbbell className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                <span>
                  <span className="mono-num">30</span>일 누적 볼륨
                </span>
              </div>
              <div
                className="mono-num text-2xl font-extrabold"
                style={{ color: 'var(--ink)' }}
              >
                {kpiSummary.totalVolumeKg.toLocaleString()} kg
              </div>
            </div>

            <div className="surface-card p-4 space-y-1">
              <div
                className="flex items-center gap-1.5 text-xs"
                style={{ color: 'var(--muted)' }}
              >
                <Layers className="w-3.5 h-3.5" style={{ color: 'var(--ok)' }} />
                <span>완료 세트 합계</span>
              </div>
              <div
                className="mono-num text-2xl font-extrabold"
                style={{ color: 'var(--ink)' }}
              >
                {kpiSummary.totalSets} 세트
              </div>
            </div>

            <div className="surface-card p-4 space-y-1">
              <div
                className="flex items-center gap-1.5 text-xs"
                style={{ color: 'var(--muted)' }}
              >
                <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--cyan)' }} />
                <span>
                  <span className="mono-num">6</span>축 균형 평균
                </span>
              </div>
              <div
                className="mono-num text-2xl font-extrabold"
                style={{ color: 'var(--cyan)' }}
              >
                {kpiSummary.avgRadar}점
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Custom SVG 6-Axis Hexagonal Radar Chart */}
            <section className="lg:col-span-6 surface-card p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3
                  className="text-base font-bold"
                  style={{ color: 'var(--ink)' }}
                >
                  <span className="mono-num">30</span>일 <span className="mono-num">6</span>축 부위 레이더
                </h3>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  최고 활성:{' '}
                  <strong
                    style={{
                      color: getMuscleColor(kpiSummary.topMuscle, theme),
                    }}
                  >
                    {MUSCLE_META[kpiSummary.topMuscle].label}
                  </strong>{' '}
                  (<span className="mono-num">{kpiSummary.topScore}</span>점)
                </span>
              </div>

              <div className="flex items-center justify-center">
                <svg
                  viewBox="0 0 360 320"
                  className="w-full max-w-[380px] h-auto"
                  role="img"
                  aria-label="가슴, 등, 하체, 어깨, 팔, 코어 6축 30일 레이더 차트"
                >
                  {/* Concentric Hexagon Gridlines */}
                  {radarGeometry.ringPolygons.map((ring) => (
                    <polygon
                      key={ring.pct}
                      points={ring.pts}
                      fill="none"
                      stroke={
                        theme === 'dark'
                          ? 'rgba(164, 194, 232, 0.22)'
                          : 'rgba(52, 65, 84, 0.2)'
                      }
                      strokeWidth="1"
                    />
                  ))}

                  {/* Radial Axis Spokes */}
                  {radarGeometry.axes.map((axis) => (
                    <line
                      key={axis.muscle}
                      x1={radarGeometry.cx}
                      y1={radarGeometry.cy}
                      x2={axis.outer.x}
                      y2={axis.outer.y}
                      stroke={
                        theme === 'dark'
                          ? 'rgba(164, 194, 232, 0.22)'
                          : 'rgba(52, 65, 84, 0.2)'
                      }
                      strokeWidth="1"
                    />
                  ))}

                  {/* Scale Reference Numbers */}
                  {[25, 50, 75, 100].map((val) => (
                    <text
                      key={val}
                      x={radarGeometry.cx + 4}
                      y={radarGeometry.cy - (96 * val) / 100 + 4}
                      fontSize="9"
                      fill="var(--muted)"
                      className="mono-num"
                    >
                      {val}
                    </text>
                  ))}

                  {/* Filled Data Polygon */}
                  <polygon
                    points={radarGeometry.dataPolygonPoints}
                    fill={
                      theme === 'dark'
                        ? 'rgba(74, 212, 230, 0.24)'
                        : 'rgba(11, 126, 147, 0.18)'
                    }
                    stroke="var(--cyan)"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                  />

                  {/* Vertex Dots & Numeric Labels */}
                  {radarGeometry.axes.map((axis) => (
                    <g key={axis.muscle}>
                      <circle
                        cx={axis.dataPt.x}
                        cy={axis.dataPt.y}
                        r="4.2"
                        fill={axis.color}
                        stroke="var(--surface)"
                        strokeWidth="1.5"
                      />
                      <text
                        x={axis.labelPos.x}
                        y={axis.labelPos.y - 4}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="700"
                        fill="var(--ink)"
                      >
                        {axis.label}
                      </text>
                      <text
                        x={axis.labelPos.x}
                        y={axis.labelPos.y + 11}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="700"
                        fill={axis.color}
                        className="mono-num"
                      >
                        {axis.score}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              {/* 6-Axis Score Strip */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {radarGeometry.axes.map((axis) => (
                  <div
                    key={axis.muscle}
                    className="surface-elev px-2 py-2 text-center"
                  >
                    <div
                      className="text-[11px] font-semibold"
                      style={{ color: axis.color }}
                    >
                      {axis.label}
                    </div>
                    <div
                      className="mono-num text-sm font-bold"
                      style={{ color: 'var(--ink)' }}
                    >
                      {axis.score}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Per-Exercise Tier Mastery Progress Bars */}
            <section className="lg:col-span-6 surface-card p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3
                  className="text-base font-bold"
                  style={{ color: 'var(--ink)' }}
                >
                  종목별 티어 마스터리 진행도
                </h3>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  <span className="mono-num">{tierProgress.length}</span>개 룬 슬롯
                </span>
              </div>

              <div className="space-y-3">
                {tierProgress.map((item) => {
                  const pct = starProgressPct(item.mp, item.tierIndex);
                  const tierColor = TIER_COLORS[item.tierIndex] ?? TIER_COLORS[0];
                  const muscleColor = getMuscleColor(item.muscle, theme);

                  return (
                    <div
                      key={item.exerciseId}
                      className="surface-elev p-3.5 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: 'var(--bg-subtle)',
                              color: muscleColor,
                            }}
                          >
                            {item.slot}
                          </span>
                          <span
                            className="text-sm font-bold"
                            style={{ color: 'var(--ink)' }}
                          >
                            {item.exerciseName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-bold"
                            style={{ color: tierColor }}
                          >
                            {TIERS[item.tierIndex]}
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-xs font-semibold">
                            <Star
                              className="w-3.5 h-3.5"
                              style={{ color: tierColor, fill: tierColor }}
                            />
                            <span
                              className="mono-num"
                              style={{ color: 'var(--ink-secondary)' }}
                            >
                              {item.stars}/8
                            </span>
                          </span>
                        </div>
                      </div>

                      <div
                        className="h-2.5 w-full rounded-full overflow-hidden"
                        style={{ backgroundColor: 'var(--bg-subtle)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: tierColor,
                          }}
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span style={{ color: 'var(--muted)' }}>
                          MP{' '}
                          <span
                            className="mono-num font-semibold"
                            style={{ color: 'var(--ink-secondary)' }}
                          >
                            {item.mp.toLocaleString()} /{' '}
                            {item.nextPromoMp.toLocaleString()}
                          </span>
                        </span>

                        <div className="flex items-center gap-3">
                          <span style={{ color: 'var(--muted)' }}>
                            {item.exerciseId === 'run5k' ? '기준' : 'e1RM'}{' '}
                            <span
                              className="mono-num font-semibold"
                              style={{ color: 'var(--ink)' }}
                            >
                              {item.exerciseId === 'run5k'
                                ? `${item.e1rmKg}분`
                                : `${item.e1rmKg} kg`}
                            </span>
                          </span>
                          <span
                            className="mono-num font-bold"
                            style={{ color: tierColor }}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarStatsView;
