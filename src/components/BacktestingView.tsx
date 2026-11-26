import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Crosshair,
  Flame,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  ComposedChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AppLang } from '../types';
import { BACKTESTING_CASES } from '../data/backtestingCases';
import { CategoryTag } from './SemanticBadges';
import { UI_COPY, tr, translateLeadTime, translateAlertLabel } from '../i18n';

interface BacktestingViewProps {
  lang: AppLang;
}

export const BacktestingView: React.FC<BacktestingViewProps> = ({ lang }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    BACKTESTING_CASES[0].id
  );
  const [selectedMonthOffset, setSelectedMonthOffset] = useState<number>(
    BACKTESTING_CASES[0].detectionMonthOffset
  );

  const c = UI_COPY[lang];

  const activeCase =
    BACKTESTING_CASES.find((cs) => cs.id === selectedCaseId) ??
    BACKTESTING_CASES[0];

  const activeSnapshot =
    activeCase.timeline.find((s) => s.monthOffset === selectedMonthOffset) ??
    activeCase.timeline[6];

  const handleSelectCase = (id: string) => {
    setSelectedCaseId(id);
    const found = BACKTESTING_CASES.find((cs) => cs.id === id);
    if (found) {
      setSelectedMonthOffset(found.detectionMonthOffset);
    }
  };

  const isBeforeAlert = selectedMonthOffset < activeCase.detectionMonthOffset;
  const isActionWindow =
    selectedMonthOffset >= activeCase.detectionMonthOffset &&
    selectedMonthOffset <= activeCase.detectionMonthOffset + 2;
  const isAtOrAfterPeak = selectedMonthOffset >= activeCase.peakMonthOffset;

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-5 sm:py-6 space-y-5">
      <div className="relative rounded-[20px] bg-surface border border-line p-6 overflow-hidden shadow-card flex flex-wrap items-center justify-between gap-4">
        <div className="relative z-10">
          <h1 className="font-display text-[24px] font-extrabold text-ink">
            {c.timeMachineTitle}
          </h1>
          <p className="text-[13px] text-ink-2 mt-1">
            {c.timeMachineSub}
          </p>
        </div>

        <span className="relative z-10 font-mono text-[12px] font-semibold text-accent bg-accent-soft border border-accent-line px-3.5 py-1.5 rounded-full">
          {c.detectedEarly} · {translateLeadTime(activeCase.leadTimeMonths, lang)}
        </span>
      </div>

      {/* Case Study Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {BACKTESTING_CASES.map((cs) => {
          const isSelected = cs.id === activeCase.id;
          return (
            <button
              key={cs.id}
              type="button"
              onClick={() => handleSelectCase(cs.id)}
              className={`card-humanist p-4 rounded-[16px] text-left border ${
                isSelected
                  ? 'bg-surface border-accent ring-1 ring-accent/15'
                  : 'bg-surface hover:bg-soft border-line'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-[13.5px] font-bold text-ink">
                  {cs.shortTabTitle}
                </span>
                <CategoryTag category={cs.category} lang={lang} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                <span className="text-accent font-medium">
                  {translateLeadTime(cs.leadTimeMonths, lang)}
                </span>
                <span className="text-ink-2">
                  Score {cs.detectionScore}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Chart & Scrubber */}
      <div className="rounded-[20px] bg-surface border border-line p-4 sm:p-6 space-y-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-line">
          <div className="max-w-[680px] space-y-1">
            <h2 className="font-display text-[17px] font-bold text-ink">
              {activeCase.title}
            </h2>
            <p className="text-[13px] text-ink-2 leading-[1.45]">
              {activeCase.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setSelectedMonthOffset(activeCase.detectionMonthOffset)
              }
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                selectedMonthOffset === activeCase.detectionMonthOffset
                  ? 'bg-pop text-on-pop border-edge'
                  : 'bg-accent-soft text-accent border-accent-line'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>
                {c.radarAlert} (M{activeCase.detectionMonthOffset})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMonthOffset(activeCase.peakMonthOffset)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                selectedMonthOffset === activeCase.peakMonthOffset
                  ? 'bg-gold text-on-gold border-danger'
                  : 'bg-danger-soft text-danger border-danger-line'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>
                {c.peakLabel} (M{activeCase.peakMonthOffset})
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[12px]">
            <div className="flex flex-wrap items-center gap-5 text-ink-2">
              <span className="inline-flex items-center gap-1.5 text-ink font-medium">
                <span className="w-3 h-[2.5px] bg-ink" />
                <span>{tr('Radar Score', lang)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-[3px] bg-pop" />
                <span>{tr('Creator Replication', lang)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-[3px] bg-[#8F78F5]" />
                <span>{tr('Google Trends', lang)}</span>
              </span>
            </div>

            <span className="font-mono text-[11px] text-accent font-medium">
              {translateAlertLabel(activeCase.detectionDateLabel, lang)}
            </span>
          </div>

          <div className="h-[268px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={activeCase.timeline}
                margin={{ top: 22, right: 20, left: -18, bottom: 4 }}
                onClick={(state) => {
                  if (
                    state &&
                    state.activePayload &&
                    state.activePayload[0]?.payload
                  ) {
                    setSelectedMonthOffset(
                      state.activePayload[0].payload.monthOffset
                    );
                  }
                }}
              >
                <CartesianGrid
                  stroke="var(--mw-line)"
                  strokeOpacity={0.2}
                  vertical={false}
                  strokeWidth={1}
                />
                <XAxis
                  dataKey="monthLabel"
                  tick={{
                    fontSize: 11,
                    fill: 'var(--mw-ink-3)',
                    fontFamily: 'JetBrains Mono',
                  }}
                  axisLine={{ stroke: 'var(--mw-line)' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 105]}
                  tick={{
                    fontSize: 11,
                    fill: 'var(--mw-ink-3)',
                    fontFamily: 'JetBrains Mono',
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--mw-surface)',
                    border: '2px solid var(--mw-edge)',
                    borderRadius: '6px',
                    color: 'var(--mw-ink)',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono',
                  }}
                />

                <ReferenceLine
                  x={`M${activeCase.detectionMonthOffset}`}
                  stroke="#8F78F5"
                  strokeWidth={1.75}
                  label={{
                    value: `${tr('RADAR ALERT', lang)} (${activeCase.detectionScore})`,
                    position: 'top',
                    fill: '#8F78F5',
                    fontSize: 11,
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 600,
                  }}
                />

                <ReferenceLine
                  x={`M${activeCase.peakMonthOffset}`}
                  stroke="var(--mw-danger)"
                  strokeWidth={1.5}
                  label={{
                    value: tr('PEAK', lang),
                    position: 'top',
                    fill: 'var(--mw-danger)',
                    fontSize: 11,
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 600,
                  }}
                />

                <ReferenceLine
                  x={activeSnapshot.monthLabel}
                  stroke="var(--mw-ink-3)"
                  strokeWidth={1.5}
                />

                <Area
                  type="monotone"
                  dataKey="googleTrends"
                  name={tr('Google Trends', lang)}
                  stroke="#8F78F5"
                  strokeWidth={1.75}
                  fill="#8F78F5"
                  fillOpacity={0.18}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="creatorReplication"
                  name={tr('Creator Replication', lang)}
                  stroke="#FF6445"
                  strokeWidth={1.75}
                  dot={{ r: 2.5, fill: '#FF6445' }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="radarScore"
                  name={tr('Radar Score', lang)}
                  stroke="var(--mw-ink)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: 'var(--mw-ink)' }}
                  activeDot={{ r: 5, fill: '#FF6445' }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scrubber */}
        <div className="p-4 rounded-[14px] bg-soft border border-line space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label
              htmlFor="time-machine-scrubber"
              className="text-[12px] font-medium text-ink flex items-center gap-2"
            >
              <Clock className="w-3.5 h-3.5 text-ink-2" />
              <span>
                {c.dragSlider} —{' '}
                <span className="font-mono font-semibold">
                  {activeSnapshot.monthLabel} ({activeSnapshot.calendarDate})
                </span>
              </span>
            </label>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={selectedMonthOffset <= -12}
                onClick={() =>
                  setSelectedMonthOffset((m) => Math.max(-12, m - 1))
                }
                aria-label={tr('Previous month', lang)}
                className="p-1.5 rounded-full bg-surface hover:bg-canvas border border-line disabled:opacity-40 text-ink"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={selectedMonthOffset >= 0}
                onClick={() =>
                  setSelectedMonthOffset((m) => Math.min(0, m + 1))
                }
                aria-label={tr('Next month', lang)}
                className="p-1.5 rounded-full bg-surface hover:bg-canvas border border-line disabled:opacity-40 text-ink"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <input
            id="time-machine-scrubber"
            type="range"
            min={-12}
            max={0}
            step={1}
            value={selectedMonthOffset}
            onChange={(e) => setSelectedMonthOffset(Number(e.target.value))}
            className="w-full radar-slider"
          />

          <div className="flex justify-between gap-1 overflow-x-auto font-mono text-[11px] text-ink-2">
            {activeCase.timeline.map((pt) => (
              <button
                key={pt.monthOffset}
                type="button"
                onClick={() => setSelectedMonthOffset(pt.monthOffset)}
                className={`px-2 py-0.5 rounded-full transition-colors ${
                  pt.monthOffset === selectedMonthOffset
                    ? 'bg-pop text-on-pop font-semibold'
                    : pt.monthOffset === activeCase.detectionMonthOffset
                    ? 'text-accent font-semibold'
                    : pt.monthOffset === activeCase.peakMonthOffset
                    ? 'text-danger font-semibold'
                    : 'hover:text-ink'
                }`}
              >
                {pt.monthLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Historical Snapshot Callout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 p-4 rounded-[14px] bg-surface border border-line space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-ink text-surface">
                {activeSnapshot.monthLabel} · {activeSnapshot.calendarDate}
              </span>
              {isBeforeAlert && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-warn-soft text-warn border border-warn-line">
                  {c.earlySignal}
                </span>
              )}
              {isActionWindow && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-accent-soft text-accent border border-accent-line">
                  {c.optimalWindow}
                </span>
              )}
              {!isBeforeAlert && !isActionWindow && !isAtOrAfterPeak && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-warn-soft text-warn border border-warn-line">
                  {c.escalatingComp}
                </span>
              )}
              {isAtOrAfterPeak && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-danger-soft text-danger border border-danger-line">
                  {c.mainstreamSat}
                </span>
              )}
            </div>

            <div className="text-[14px] font-semibold text-ink">
              {activeSnapshot.marketStatus}
            </div>

            <p className="text-[13px] text-ink-2 leading-[1.45]">
              {activeSnapshot.editorialLog}
            </p>

            <div className="pt-3 border-t border-line grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <div className="text-[11px] text-ink-2">
                  {tr('Radar Score', lang)}
                </div>
                <div className="font-mono text-[17px] font-semibold text-ink mt-0.5 tabular-nums">
                  {activeSnapshot.radarScore}
                  <span className="text-[11px] text-ink-2">
                    /100
                  </span>
                </div>
              </div>
              <div>
                <div className="text-[11px] text-ink-2">
                  {tr('Mentions', lang)}
                </div>
                <div className="font-mono text-[15px] font-semibold text-ink mt-1 tabular-nums">
                  {activeSnapshot.nicheMentionsCount}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-ink-2">
                  {tr('Creators', lang)}
                </div>
                <div className="font-mono text-[15px] font-semibold text-warn mt-1 tabular-nums">
                  {activeSnapshot.activeCreatorsCount}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-ink-2">
                  Google Trends
                </div>
                <div className="font-mono text-[15px] font-semibold text-accent mt-1 tabular-nums">
                  {activeSnapshot.googleTrendsRaw}
                  <span className="text-[11px]">/100</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 p-5 rounded-[14px] bg-lilac text-on-pop sticker flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-on-pop">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{c.outcomeLabel}</span>
              </div>
              <p className="text-[12.5px] text-on-pop leading-[1.55]">
                {activeCase.outcome}
              </p>
            </div>

            <div className="pt-3 border-t border-on-pop/25">
              <div className="font-mono text-[11px] uppercase tracking-[0.05em] text-on-pop">
                {c.takeawayLabel}
              </div>
              <p className="text-[12.5px] text-on-pop font-medium leading-[1.45] mt-1">
                {activeCase.mediawanLesson}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
