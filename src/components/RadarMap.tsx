import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, UserCheck } from 'lucide-react';
import { AppLang, MediawanCategory, MicroTrend } from '../types';
import { translateMediawanCategory, UI_COPY } from '../i18n';
import { CATEGORY_COLORS, CategoryTag, CertaintyBadge } from './SemanticBadges';
import { TrendThumbnail } from './TrendThumbnail';

const SECTORS: MediawanCategory[] = [
  'Fiction',
  'Animation',
  'Documentary',
  'Entertainment',
  'Talents',
];

const WINDOW_DAYS = 21;
const OUTER_RADIUS = 180;
const INNER_RADIUS = 34;
const SECTOR_DEG = 360 / SECTORS.length;
const SECTOR_PAD_DEG = 7;

const radiusForDays = (days: number) =>
  INNER_RADIUS +
  (Math.min(WINDOW_DAYS, Math.max(0, days)) / WINDOW_DAYS) *
    (OUTER_RADIUS - INNER_RADIUS);

const polar = (radius: number, deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return { x: radius * Math.cos(rad), y: radius * Math.sin(rad) };
};

const sectorStart = (index: number) => -90 + index * SECTOR_DEG;

/** Labels are enlarged and shortened on phones, where the drawing is small. */
const SHORT_LABELS: Partial<Record<string, string>> = {
  Animation: 'Anim.',
  Documentaire: 'Docu.',
  Documentary: 'Docu.',
  Divertissement: 'Divert.',
  Entertainment: 'Entert.',
};

function useIsNarrow() {
  const query = '(max-width: 639px)';
  const [narrow, setNarrow] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setNarrow(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return narrow;
}

interface Blip {
  trend: MicroTrend;
  rank: number;
  distance: number;
  angle: number;
  minAngle: number;
  maxAngle: number;
  size: number;
}

/**
 * Distance encodes age and is never altered. Overlapping dots are only moved
 * sideways, inside their own category sector.
 */
function layoutBlips(trends: MicroTrend[]): Blip[] {
  const ranked = trends.map((trend, i) => ({ trend, rank: i + 1 }));
  const blips: Blip[] = SECTORS.flatMap((category, sectorIndex) => {
    const inSector = ranked
      .filter((r) => r.trend.category === category)
      .sort((a, b) => a.trend.id.localeCompare(b.trend.id));
    const minAngle = sectorStart(sectorIndex) + SECTOR_PAD_DEG;
    const maxAngle = sectorStart(sectorIndex + 1) - SECTOR_PAD_DEG;
    return inSector.map((r, i) => ({
      ...r,
      distance: radiusForDays(r.trend.daysSinceT0),
      angle: minAngle + ((i + 0.5) / inSector.length) * (maxAngle - minAngle),
      minAngle,
      maxAngle,
      size:
        10 + Math.min(1, Math.max(0, (r.trend.emergenceScore - 70) / 30)) * 8,
    }));
  });

  for (let pass = 0; pass < 60; pass += 1) {
    for (let i = 0; i < blips.length; i += 1) {
      for (let j = i + 1; j < blips.length; j += 1) {
        const a = blips[i];
        const b = blips[j];
        if (a.minAngle !== b.minAngle) continue;
        const pa = polar(a.distance, a.angle);
        const pb = polar(b.distance, b.angle);
        const overlap = a.size + b.size + 3 - Math.hypot(pa.x - pb.x, pa.y - pb.y);
        if (overlap <= 0) continue;
        const direction = a.angle <= b.angle ? -1 : 1;
        const shift = (overlap / 2 / ((a.distance + b.distance) / 2)) * 57.3;
        a.angle = Math.min(a.maxAngle, Math.max(a.minAngle, a.angle + direction * shift));
        b.angle = Math.min(b.maxAngle, Math.max(b.minAngle, b.angle - direction * shift));
      }
    }
  }
  return blips;
}

interface RadarMapProps {
  /** Already filtered and sorted: the array order gives each rank. */
  trends: MicroTrend[];
  selectedTrendId: string | null;
  onSelectTrend: (trendId: string, rank: number) => void;
  lang: AppLang;
}

export const RadarMap: React.FC<RadarMapProps> = ({
  trends,
  selectedTrendId,
  onSelectTrend,
  lang,
}) => {
  const c = UI_COPY[lang];
  const narrow = useIsNarrow();
  const [activeId, setActiveId] = useState<string | null>(null);
  const blips = useMemo(() => layoutBlips(trends), [trends]);
  const active =
    blips.find((b) => b.trend.id === activeId) ??
    blips.find((b) => b.trend.id === selectedTrendId) ??
    blips.find((b) => b.rank === 1);
  const unit = lang === 'fr' ? 'j' : 'd';

  if (!active) return null;

  // Paint the active dot last so it sits on top of its neighbours.
  const painted = [...blips].sort(
    (a, b) => Number(a === active) - Number(b === active)
  );

  const handleClick = (blip: Blip) => {
    // Touch screens have no hover: the first tap previews, the second opens.
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch && active.trend.id !== blip.trend.id) {
      setActiveId(blip.trend.id);
      return;
    }
    onSelectTrend(blip.trend.id, blip.rank);
  };

  const creator = active.trend.viralVideo.creator.handle;

  return (
    <section
      aria-labelledby="radar-map-title"
      className="rounded-[24px] bg-surface border shadow-card p-3 sm:p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="radar-map-title" className="text-[20px] font-extrabold text-ink">
          {c.radarMapTitle}
        </h2>
        <p className="text-[12.5px] text-ink-2">{c.radarMapHint}</p>
      </div>

      <div className="mt-3 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] items-center">
        <div className="min-w-0">
          <svg
            viewBox={narrow ? '-255 -212 510 424' : '-285 -212 570 424'}
            className="w-full max-h-[460px] block mx-auto select-none"
            role="group"
            aria-label={c.radarMapTitle}
          >
            <circle r={OUTER_RADIUS} className="fill-soft" />
            <g className="radar-sweep" aria-hidden="true">
              <path
                d={`M0 0 L${OUTER_RADIUS} 0 A${OUTER_RADIUS} ${OUTER_RADIUS} 0 0 0 ${
                  polar(OUTER_RADIUS, -55).x
                } ${polar(OUTER_RADIUS, -55).y} Z`}
                fill="#B7A6FF"
                fillOpacity="0.3"
              />
              <line x2={OUTER_RADIUS} stroke="#8F78F5" strokeWidth="2" />
            </g>

            {[7, 14, WINDOW_DAYS].map((days) => (
              <circle
                key={days}
                r={radiusForDays(days)}
                fill="none"
                className={days === WINDOW_DAYS ? 'stroke-edge' : 'stroke-line'}
                strokeWidth={days === WINDOW_DAYS ? 2.5 : 1.5}
                strokeDasharray={days === WINDOW_DAYS ? undefined : '4 5'}
              />
            ))}
            {SECTORS.map((category, i) => {
              const edge = polar(OUTER_RADIUS, sectorStart(i));
              const mid = sectorStart(i) + SECTOR_DEG / 2;
              const label = polar(OUTER_RADIUS + 14, mid);
              const cos = Math.cos((mid * Math.PI) / 180);
              return (
                <g key={category}>
                  <line x2={edge.x} y2={edge.y} className="stroke-line" strokeWidth="1.5" />
                  <text
                    x={label.x}
                    y={label.y}
                    dominantBaseline="middle"
                    textAnchor={cos > 0.25 ? 'start' : cos < -0.25 ? 'end' : 'middle'}
                    className={`fill-ink font-bold ${narrow ? 'text-[21px]' : 'text-[13px]'}`}
                  >
                    {narrow
                      ? SHORT_LABELS[translateMediawanCategory(category, lang)] ??
                        translateMediawanCategory(category, lang)
                      : translateMediawanCategory(category, lang)}
                  </text>
                </g>
              );
            })}
            {[7, 14, WINDOW_DAYS].map((days) => (
              <text
                key={days}
                x="5"
                y={-radiusForDays(days) + (narrow ? 19 : 12)}
                className={`fill-ink-3 font-semibold ${narrow ? 'text-[17px]' : 'text-[10.5px]'}`}
                aria-hidden="true"
              >
                {days}
                {unit}
              </text>
            ))}
            <circle r="7" fill="#FF6445" stroke="#1D1D1F" strokeWidth="2" />

            {painted.map((blip) => {
              const { x, y } = polar(blip.distance, blip.angle);
              const isActive = blip === active;
              return (
                <g
                  key={blip.trend.id}
                  transform={`translate(${x} ${y})`}
                  className="radar-blip"
                  data-active={isActive}
                  role="button"
                  tabIndex={0}
                  aria-label={`#${blip.rank} ${blip.trend.title}, score ${blip.trend.emergenceScore}, ${blip.trend.daysSinceT0}${unit}`}
                  onMouseEnter={() => setActiveId(blip.trend.id)}
                  onFocus={() => setActiveId(blip.trend.id)}
                  onClick={() => handleClick(blip)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectTrend(blip.trend.id, blip.rank);
                    }
                  }}
                >
                  {/* Larger invisible hit area for fingers. */}
                  <circle r={blip.size + 8} fill="transparent" />
                  <circle
                    r={blip.size + 7}
                    fill="none"
                    className="radar-focus stroke-accent opacity-0"
                    strokeWidth="2.5"
                  />
                  <g className="radar-dot">
                    <circle cx="2.5" cy="2.5" r={blip.size} fill="var(--mw-shadow)" />
                    <circle
                      r={blip.size}
                      fill={CATEGORY_COLORS[blip.trend.category]}
                      stroke="#1D1D1F"
                      strokeWidth={isActive ? 3 : 2}
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#1D1D1F"
                      className="text-[11px] font-extrabold pointer-events-none"
                    >
                      {blip.rank}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        <article
          aria-live="polite"
          className="sticker rounded-[20px] bg-canvas overflow-hidden"
        >
          <div className="relative aspect-video overflow-hidden bg-[#1D1D1F]">
            <TrendThumbnail trend={active.trend} variant="hero" />
            <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-pop text-on-pop border-2 border-[#1D1D1F] text-[12px] font-extrabold">
              #{active.rank}
            </span>
          </div>
          <div className="p-4 space-y-2.5">
            <div className="flex items-end justify-between gap-3">
              <span className="text-[52px] font-extrabold leading-none text-ink tabular-nums">
                {active.trend.emergenceScore}
              </span>
              <span className="sticker rotate-3 px-3 py-1 rounded-full bg-lilac text-on-pop text-[16px] font-extrabold tabular-nums">
                {active.trend.velocity7d >= 0 ? '+' : ''}
                {active.trend.velocity7d}%
              </span>
            </div>
            <h3 className="text-[16px] font-bold leading-snug text-ink">
              {active.trend.title}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5">
              <CategoryTag category={active.trend.category} lang={lang} />
              <span className="px-2.5 py-0.5 rounded-full bg-surface border border-line text-[11px] font-semibold text-ink">
                {lang === 'fr' ? 'J+' : 'D+'}
                {active.trend.daysSinceT0}
              </span>
              <CertaintyBadge certainty={active.trend.certainty} lang={lang} />
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-ink-2 min-w-0">
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {c.byCreator} {creator}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelectTrend(active.trend.id, active.rank)}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-full border bg-pop hover:bg-pop-hover text-on-pop text-[13px] font-bold shadow-xs"
            >
              <span>{c.openBrief}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </article>
      </div>
    </section>
  );
};
