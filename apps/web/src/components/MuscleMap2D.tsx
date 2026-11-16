import { useState } from 'react';
import { MUSCLE_META } from '@rune-pt/core';
import type { MuscleGroupId, ThemeMode } from '@rune-pt/core';

export interface MuscleMap2DProps {
  highlightedMuscles: MuscleGroupId[];
  theme: ThemeMode;
  onSelectMuscle?: (m: MuscleGroupId) => void;
  activeFilter?: MuscleGroupId | 'all';
}

const MUSCLE_ORDER: MuscleGroupId[] = ['chest', 'back', 'leg', 'shoulder', 'arm', 'core'];

interface RegionShape {
  id: string;
  muscle: MuscleGroupId;
  d: string;
}

/** 전면 해부 경로 (좌표계 0..160 × 0..286, 가슴은 쇄골 아래 y=54~86 흉부 상단에 배치) */
const FRONT_REGIONS: RegionShape[] = [
  // 가슴 (대흉근 좌·우 — 늑골/복부 위 상부 흉곽)
  {
    id: 'front-chest-l',
    muscle: 'chest',
    d: 'M 78 55 L 57 55 Q 52 68 56 83 Q 66 88 78 85 Z',
  },
  {
    id: 'front-chest-r',
    muscle: 'chest',
    d: 'M 82 55 L 103 55 Q 108 68 104 83 Q 94 88 82 85 Z',
  },
  // 어깨 (전면·측면 삼각근)
  {
    id: 'front-shoulder-l',
    muscle: 'shoulder',
    d: 'M 56 48 Q 43 52 41 68 L 49 74 Q 53 64 57 56 Z',
  },
  {
    id: 'front-shoulder-r',
    muscle: 'shoulder',
    d: 'M 104 48 Q 117 52 119 68 L 111 74 Q 107 64 103 56 Z',
  },
  // 팔 (상완이두근 + 전완근)
  {
    id: 'front-bicep-l',
    muscle: 'arm',
    d: 'M 41 71 L 50 75 L 49 107 L 39 105 Q 37 88 41 71 Z',
  },
  {
    id: 'front-bicep-r',
    muscle: 'arm',
    d: 'M 119 71 L 110 75 L 111 107 L 121 105 Q 123 88 119 71 Z',
  },
  {
    id: 'front-forearm-l',
    muscle: 'arm',
    d: 'M 39 109 L 48 111 L 43 147 L 34 145 Q 34 126 39 109 Z',
  },
  {
    id: 'front-forearm-r',
    muscle: 'arm',
    d: 'M 121 109 L 112 111 L 117 147 L 126 145 Q 126 126 121 109 Z',
  },
  // 코어 (복직근 6분할 + 외복사근 — 가슴 아래 y=90~144)
  {
    id: 'front-abs-1l',
    muscle: 'core',
    d: 'M 68 90 L 78 90 L 78 104 L 67 104 Z',
  },
  {
    id: 'front-abs-1r',
    muscle: 'core',
    d: 'M 82 90 L 92 90 L 93 104 L 82 104 Z',
  },
  {
    id: 'front-abs-2l',
    muscle: 'core',
    d: 'M 67 107 L 78 107 L 78 121 L 68 121 Z',
  },
  {
    id: 'front-abs-2r',
    muscle: 'core',
    d: 'M 82 107 L 93 107 L 92 121 L 82 121 Z',
  },
  {
    id: 'front-abs-3l',
    muscle: 'core',
    d: 'M 68 124 L 78 124 L 78 143 L 72 141 Z',
  },
  {
    id: 'front-abs-3r',
    muscle: 'core',
    d: 'M 82 124 L 92 124 L 88 141 L 82 143 Z',
  },
  {
    id: 'front-oblique-l',
    muscle: 'core',
    d: 'M 57 88 L 65 91 L 65 137 L 58 131 Q 55 110 57 88 Z',
  },
  {
    id: 'front-oblique-r',
    muscle: 'core',
    d: 'M 103 88 L 95 91 L 95 137 L 102 131 Q 105 110 103 88 Z',
  },
  // 하체 (대퇴사두근 + 전경골/종아리 윤곽)
  {
    id: 'front-quad-l',
    muscle: 'leg',
    d: 'M 57 154 Q 68 158 77 166 L 75 216 Q 66 218 59 213 Q 54 184 57 154 Z',
  },
  {
    id: 'front-quad-r',
    muscle: 'leg',
    d: 'M 103 154 Q 92 158 83 166 L 85 216 Q 94 218 101 213 Q 106 184 103 154 Z',
  },
  {
    id: 'front-shin-l',
    muscle: 'leg',
    d: 'M 60 223 L 73 223 Q 74 246 70 267 L 62 267 Q 58 245 60 223 Z',
  },
  {
    id: 'front-shin-r',
    muscle: 'leg',
    d: 'M 100 223 L 87 223 Q 86 246 90 267 L 98 267 Q 102 245 100 223 Z',
  },
];

/** 후면 해부 경로 (좌표계 0..160 × 0..286, translate(160, 0)로 배치) */
const BACK_REGIONS: RegionShape[] = [
  // 어깨 (후면 삼각근)
  {
    id: 'back-shoulder-l',
    muscle: 'shoulder',
    d: 'M 56 48 Q 43 52 41 68 L 49 74 Q 53 64 57 56 Z',
  },
  {
    id: 'back-shoulder-r',
    muscle: 'shoulder',
    d: 'M 104 48 Q 117 52 119 68 L 111 74 Q 107 64 103 56 Z',
  },
  // 등 (상부 승모근 + 광배근 + 척추기립근)
  {
    id: 'back-traps',
    muscle: 'back',
    d: 'M 72 41 L 88 41 L 103 54 L 83 84 L 77 84 L 57 54 Z',
  },
  {
    id: 'back-lat-l',
    muscle: 'back',
    d: 'M 54 66 L 76 85 L 77 121 L 64 119 Q 54 94 54 66 Z',
  },
  {
    id: 'back-lat-r',
    muscle: 'back',
    d: 'M 106 66 L 84 85 L 83 121 L 96 119 Q 106 94 106 66 Z',
  },
  {
    id: 'back-erector',
    muscle: 'back',
    d: 'M 67 123 L 93 123 L 90 144 L 70 144 Z',
  },
  // 팔 (상완삼두근 + 후면 전완근)
  {
    id: 'back-tricep-l',
    muscle: 'arm',
    d: 'M 41 71 L 50 75 L 49 107 L 39 105 Q 37 88 41 71 Z',
  },
  {
    id: 'back-tricep-r',
    muscle: 'arm',
    d: 'M 119 71 L 110 75 L 111 107 L 121 105 Q 123 88 119 71 Z',
  },
  {
    id: 'back-forearm-l',
    muscle: 'arm',
    d: 'M 39 109 L 48 111 L 43 147 L 34 145 Q 34 126 39 109 Z',
  },
  {
    id: 'back-forearm-r',
    muscle: 'arm',
    d: 'M 121 109 L 112 111 L 117 147 L 126 145 Q 126 126 121 109 Z',
  },
  // 하체 (둔근 + 햄스트링 + 비복근)
  {
    id: 'back-glute-l',
    muscle: 'leg',
    d: 'M 58 148 L 78 148 L 78 175 Q 64 178 57 169 Q 56 158 58 148 Z',
  },
  {
    id: 'back-glute-r',
    muscle: 'leg',
    d: 'M 102 148 L 82 148 L 82 175 Q 96 178 103 169 Q 104 158 102 148 Z',
  },
  {
    id: 'back-ham-l',
    muscle: 'leg',
    d: 'M 57 179 Q 68 182 77 179 L 75 216 L 59 214 Q 56 196 57 179 Z',
  },
  {
    id: 'back-ham-r',
    muscle: 'leg',
    d: 'M 103 179 Q 92 182 83 179 L 85 216 L 101 214 Q 104 196 103 179 Z',
  },
  {
    id: 'back-calf-l',
    muscle: 'leg',
    d: 'M 59 222 Q 67 219 74 223 Q 75 245 70 266 L 62 266 Q 57 244 59 222 Z',
  },
  {
    id: 'back-calf-r',
    muscle: 'leg',
    d: 'M 101 222 Q 93 219 86 223 Q 85 245 90 266 L 98 266 Q 103 244 101 222 Z',
  },
];

const BODY_SILHOUETTE_PATH =
  'M 73 36 L 73 43 L 54 47 Q 41 51 39 67 L 33 145 L 43 148 L 51 104 L 55 147 L 55 214 L 58 269 L 71 269 L 76 218 L 80 176 L 84 218 L 89 269 L 102 269 L 105 214 L 105 147 L 109 104 L 117 148 L 127 145 L 121 67 Q 119 51 106 47 L 87 43 L 87 36 Z';

export function MuscleMap2D({
  highlightedMuscles,
  theme,
  onSelectMuscle,
  activeFilter = 'all',
}: MuscleMap2DProps) {
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleGroupId | null>(null);

  const highlightedSet = new Set(highlightedMuscles);
  const isDark = theme === 'dark';

  const getMuscleColor = (m: MuscleGroupId) =>
    isDark ? MUSCLE_META[m].colorDark : MUSCLE_META[m].colorLight;

  const getRegionStyle = (muscle: MuscleGroupId) => {
    const color = getMuscleColor(muscle);
    const isHighlighted = highlightedSet.has(muscle);
    const isFilterMatch = activeFilter === 'all' || activeFilter === muscle;
    const isHovered = hoveredMuscle === muscle;

    if (activeFilter !== 'all') {
      if (isFilterMatch) {
        return {
          fill: color,
          fillOpacity: isHovered ? 0.94 : 0.84,
          stroke: color,
          strokeWidth: 1.5,
        };
      }
      return {
        fill: isDark ? 'rgba(148, 175, 210, 0.08)' : 'rgba(52, 65, 84, 0.06)',
        fillOpacity: 1,
        stroke: isDark ? 'rgba(164, 194, 232, 0.22)' : 'rgba(86, 99, 118, 0.26)',
        strokeWidth: 0.9,
      };
    }

    if (isHighlighted || isHovered) {
      return {
        fill: color,
        fillOpacity: isHovered ? 0.92 : 0.78,
        stroke: color,
        strokeWidth: isHovered ? 1.5 : 1.2,
      };
    }

    return {
      fill: isDark ? 'rgba(148, 175, 210, 0.12)' : 'rgba(52, 65, 84, 0.08)',
      fillOpacity: 1,
      stroke: isDark ? 'rgba(164, 194, 232, 0.28)' : 'rgba(86, 99, 118, 0.34)',
      strokeWidth: 0.95,
    };
  };

  const renderBodyFigure = (regions: RegionShape[], offsetX: number, viewLabel: string) => (
    <g transform={`translate(${offsetX}, 0)`}>
      {/* 머리 & 인체 기본 윤곽선 */}
      <ellipse
        cx={80}
        cy={21}
        rx={12}
        ry={15}
        fill={isDark ? 'rgba(148, 175, 210, 0.09)' : 'rgba(52, 65, 84, 0.06)'}
        stroke="var(--border-strong)"
        strokeWidth={1.1}
      />
      <path
        d={BODY_SILHOUETTE_PATH}
        fill={isDark ? 'rgba(20, 31, 49, 0.72)' : 'rgba(237, 230, 214, 0.55)'}
        stroke="var(--border-strong)"
        strokeWidth={1.1}
        strokeLinejoin="round"
      />
      {/* 해부 근육 영역 */}
      {regions.map((region) => {
        const style = getRegionStyle(region.muscle);
        return (
          <path
            key={region.id}
            d={region.d}
            fill={style.fill}
            fillOpacity={style.fillOpacity}
            stroke={style.stroke}
            strokeWidth={style.strokeWidth}
            strokeLinejoin="round"
            className={onSelectMuscle ? 'cursor-pointer transition-all duration-150' : 'transition-all duration-150'}
            aria-label={`${viewLabel} ${MUSCLE_META[region.muscle].label}`}
            onMouseEnter={() => setHoveredMuscle(region.muscle)}
            onMouseLeave={() => setHoveredMuscle(null)}
            onClick={() => onSelectMuscle?.(region.muscle)}
          />
        );
      })}
      <text
        x={80}
        y={284}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill="var(--muted)"
      >
        {viewLabel}
      </text>
    </g>
  );

  return (
    <div className="w-full select-none">
      <div
        className="rounded-lg border px-2 py-3"
        style={{
          backgroundColor: 'var(--bg-subtle)',
          borderColor: 'var(--border)',
        }}
      >
        <svg
          viewBox="0 0 320 292"
          className="mx-auto block h-auto w-full max-w-[300px]"
          role="img"
          aria-label="전면 및 후면 근육 해부 지도"
        >
          {renderBodyFigure(FRONT_REGIONS, 0, '전면')}
          <line
            x1={160}
            y1={14}
            x2={160}
            y2={274}
            stroke="var(--border)"
            strokeDasharray="3 4"
            strokeWidth={1}
          />
          {renderBodyFigure(BACK_REGIONS, 160, '후면')}
        </svg>
      </div>

      {/* 6대 부위 범례 / 필터 필 */}
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {MUSCLE_ORDER.map((muscle) => {
          const meta = MUSCLE_META[muscle];
          const color = getMuscleColor(muscle);
          const isHighlighted = highlightedSet.has(muscle);
          const isSelected = activeFilter === muscle;
          const isHovered = hoveredMuscle === muscle;

          return (
            <button
              key={muscle}
              type="button"
              onClick={() => onSelectMuscle?.(muscle)}
              onMouseEnter={() => setHoveredMuscle(muscle)}
              onMouseLeave={() => setHoveredMuscle(null)}
              aria-pressed={isSelected}
              className="flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition-all"
              style={{
                backgroundColor: isSelected
                  ? color
                  : isHighlighted || isHovered
                    ? 'var(--surface-elev)'
                    : 'var(--surface)',
                borderColor: isSelected || isHighlighted || isHovered ? color : 'var(--border)',
                color: isSelected
                  ? '#ffffff'
                  : isHighlighted || isHovered
                    ? 'var(--ink)'
                    : 'var(--muted)',
              }}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{
                  backgroundColor: isSelected ? '#ffffff' : color,
                }}
              />
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
