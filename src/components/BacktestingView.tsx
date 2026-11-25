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
import { HeroGreenWaveBackdrop } from './OrganicGreenShapes';
import { UI_COPY } from '../i18n';

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
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-5">
      <div className="relative rounded-[20px] bg-[#FFFFFF] dark:bg-[#2E2C28] border border-[#EAE4D9] dark:border-[#3E3B35] p-6 overflow-hidden shadow-card flex flex-wrap items-center justify-between gap-4">
        <HeroGreenWaveBackdrop compact />
        <div className="relative z-10">
          <h1 className="font-display text-[24px] font-extrabold text-[#22201D] dark:text-[#F5F2EC]">
            {c.timeMachineTitle}
          </h1>
          <p className="text-[13px] text-[#625C53] dark:text-[#B5AFA4] mt-1">
            {c.timeMachineSub}
          </p>
        </div>

        <span className="relative z-10 font-mono text-[12px] font-semibold text-[#1F6F43] dark:text-[#81B64C] bg-[#EBF5EE] dark:bg-[#263628] border border-[#CAE5D3] dark:border-[#395439] px-3.5 py-1.5 rounded-full">
          {c.detectedEarly} {activeCase.leadTimeMonths}
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
                  ? 'bg-[#FFFFFF] dark:bg-[#2E2C28] border-[#1F6F43] dark:border-[#81B64C] ring-1 ring-[#1F6F43]/15'
                  : 'bg-[#FFFFFF] dark:bg-[#24221F] hover:bg-[#FCFBF8] dark:hover:bg-[#2E2C28] border-[#EAE4D9] dark:border-[#3E3B35]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-[13.5px] font-bold text-[#22201D] dark:text-[#F5F2EC]">
                  {cs.shortTabTitle}
                </span>
                <CategoryTag category={cs.category} lang={lang} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#1F6F43] dark:text-[#81B64C] font-medium">
                  {cs.leadTimeMonths}
                </span>
                <span className="text-[#625C53] dark:text-[#B5AFA4]">
                  Score {cs.detectionScore}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Chart & Scrubber */}
      <div className="rounded-[20px] bg-[#FFFFFF] dark:bg-[#2E2C28] border border-[#EAE4D9] dark:border-[#3E3B35] p-6 space-y-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#EAE4D9] dark:border-[#3E3B35]">
          <div className="max-w-[680px] space-y-1">
            <h2 className="font-display text-[17px] font-bold text-[#22201D] dark:text-[#F5F2EC]">
              {activeCase.title}
            </h2>
            <p className="text-[13px] text-[#625C53] dark:text-[#B5AFA4] leading-[1.45]">
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
                  ? 'bg-[#1F6F43] dark:bg-[#81B64C] text-[#FFFFFF] dark:text-[#191815] border-[#1F6F43] dark:border-[#81B64C]'
                  : 'bg-[#EBF5EE] dark:bg-[#263628] text-[#1F6F43] dark:text-[#81B64C] border-[#CAE5D3] dark:border-[#395439]'
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
                  ? 'bg-[#991B1B] dark:bg-[#F29C9C] text-[#FFFFFF] dark:text-[#2B1818] border-[#991B1B] dark:border-[#F29C9C]'
                  : 'bg-[#FDF2F2] dark:bg-[#3A2727] text-[#991B1B] dark:text-[#F29C9C] border-[#F3CFCF] dark:border-[#5D3838]'
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
            <div className="flex flex-wrap items-center gap-5 text-[#6B6A65] dark:text-[#ABA89F]">
              <span className="inline-flex items-center gap-1.5 text-[#141413] dark:text-[#F3F2EE] font-medium">
                <span className="w-3 h-[2.5px] bg-[#141413] dark:bg-[#F3F2EE]" />
                <span>Radar Score</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-[2px] bg-[#D9822B]" />
                <span>Creator Replication</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-[2px] bg-[#55A852]" />
                <span>Google Trends</span>
              </span>
            </div>

            <span className="font-mono text-[11px] text-[#166534] dark:text-[#81B64C] font-medium">
              {activeCase.detectionDateLabel}
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
                  stroke="#7F7D75"
                  strokeOpacity={0.2}
                  vertical={false}
                  strokeWidth={1}
                />
                <XAxis
                  dataKey="monthLabel"
                  tick={{
                    fontSize: 11,
                    fill: '#8C8A82',
                    fontFamily: 'JetBrains Mono',
                  }}
                  axisLine={{ stroke: '#6E6B64' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 105]}
                  tick={{
                    fontSize: 11,
                    fill: '#8C8A82',
                    fontFamily: 'JetBrains Mono',
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#262522',
                    border: '1px solid #45423C',
                    borderRadius: '6px',
                    color: '#F3F2EE',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono',
                  }}
                />

                <ReferenceLine
                  x={`M${activeCase.detectionMonthOffset}`}
                  stroke="#55A852"
                  strokeWidth={1.75}
                  label={{
                    value: `RADAR ALERT (${activeCase.detectionScore})`,
                    position: 'top',
                    fill: '#55A852',
                    fontSize: 11,
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 600,
                  }}
                />

                <ReferenceLine
                  x={`M${activeCase.peakMonthOffset}`}
                  stroke="#D24C44"
                  strokeWidth={1.5}
                  label={{
                    value: 'PEAK',
                    position: 'top',
                    fill: '#D24C44',
                    fontSize: 11,
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 600,
                  }}
                />

                <ReferenceLine
                  x={activeSnapshot.monthLabel}
                  stroke="#8C8A82"
                  strokeWidth={1.5}
                />

                <Area
                  type="monotone"
                  dataKey="googleTrends"
                  name="Google Trends"
                  stroke="#55A852"
                  strokeWidth={1.75}
                  fill="#55A852"
                  fillOpacity={0.18}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="creatorReplication"
                  name="Creator Replication"
                  stroke="#D9822B"
                  strokeWidth={1.75}
                  dot={{ r: 2.5, fill: '#D9822B' }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="radarScore"
                  name="Radar Score"
                  stroke="#7D7B74"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#7D7B74' }}
                  activeDot={{ r: 5, fill: '#81B64C' }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scrubber */}
        <div className="p-4 rounded-[14px] bg-[#FBF9F4] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35] space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label
              htmlFor="time-machine-scrubber"
              className="text-[12px] font-medium text-[#22201D] dark:text-[#F5F2EC] flex items-center gap-2"
            >
              <Clock className="w-3.5 h-3.5 text-[#625C53] dark:text-[#B5AFA4]" />
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
                aria-label="Previous month"
                className="p-1.5 rounded-full bg-[#FFFFFF] dark:bg-[#2E2C28] hover:bg-[#F4F0E8] dark:hover:bg-[#383632] border border-[#EAE4D9] dark:border-[#3E3B35] disabled:opacity-40 text-[#22201D] dark:text-[#F5F2EC]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={selectedMonthOffset >= 0}
                onClick={() =>
                  setSelectedMonthOffset((m) => Math.min(0, m + 1))
                }
                aria-label="Next month"
                className="p-1.5 rounded-full bg-[#FFFFFF] dark:bg-[#2E2C28] hover:bg-[#F4F0E8] dark:hover:bg-[#383632] border border-[#EAE4D9] dark:border-[#3E3B35] disabled:opacity-40 text-[#22201D] dark:text-[#F5F2EC]"
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

          <div className="flex justify-between font-mono text-[10px] text-[#625C53] dark:text-[#B5AFA4]">
            {activeCase.timeline.map((pt) => (
              <button
                key={pt.monthOffset}
                type="button"
                onClick={() => setSelectedMonthOffset(pt.monthOffset)}
                className={`px-2 py-0.5 rounded-full transition-colors ${
                  pt.monthOffset === selectedMonthOffset
                    ? 'bg-[#1F6F43] dark:bg-[#81B64C] text-[#FFFFFF] dark:text-[#191815] font-semibold'
                    : pt.monthOffset === activeCase.detectionMonthOffset
                    ? 'text-[#1F6F43] dark:text-[#81B64C] font-semibold'
                    : pt.monthOffset === activeCase.peakMonthOffset
                    ? 'text-[#991B1B] dark:text-[#F29C9C] font-semibold'
                    : 'hover:text-[#22201D] dark:hover:text-[#F5F2EC]'
                }`}
              >
                {pt.monthLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Historical Snapshot Callout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 p-4 rounded-[14px] bg-[#FFFFFF] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35] space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-[#22201D] dark:bg-[#383632] text-[#FFFFFF]">
                {activeSnapshot.monthLabel} · {activeSnapshot.calendarDate}
              </span>
              {isBeforeAlert && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FDF7ED] dark:bg-[#3C2F1E] text-[#9A4D09] dark:text-[#FBBF24] border border-[#F4DFB8] dark:border-[#5C4629]">
                  {c.earlySignal}
                </span>
              )}
              {isActionWindow && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EBF5EE] dark:bg-[#263628] text-[#1F6F43] dark:text-[#81B64C] border border-[#CAE5D3] dark:border-[#395439]">
                  {c.optimalWindow}
                </span>
              )}
              {!isBeforeAlert && !isActionWindow && !isAtOrAfterPeak && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FDF7ED] dark:bg-[#3C2F1E] text-[#9A4D09] dark:text-[#FBBF24] border border-[#F4DFB8] dark:border-[#5C4629]">
                  {c.escalatingComp}
                </span>
              )}
              {isAtOrAfterPeak && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FDF2F2] dark:bg-[#3A2727] text-[#991B1B] dark:text-[#F29C9C] border border-[#F3CFCF] dark:border-[#5D3838]">
                  {c.mainstreamSat}
                </span>
              )}
            </div>

            <div className="text-[14px] font-semibold text-[#22201D] dark:text-[#F5F2EC]">
              {activeSnapshot.marketStatus}
            </div>

            <p className="text-[13px] text-[#625C53] dark:text-[#B5AFA4] leading-[1.45]">
              {activeSnapshot.editorialLog}
            </p>

            <div className="pt-3 border-t border-[#EAE4D9] dark:border-[#3E3B35] grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <div className="text-[11px] text-[#625C53] dark:text-[#B5AFA4]">
                  Radar Score
                </div>
                <div className="font-mono text-[17px] font-semibold text-[#22201D] dark:text-[#F5F2EC] mt-0.5 tabular-nums">
                  {activeSnapshot.radarScore}
                  <span className="text-[11px] text-[#625C53] dark:text-[#B5AFA4]">
                    /100
                  </span>
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#625C53] dark:text-[#B5AFA4]">
                  Mentions
                </div>
                <div className="font-mono text-[15px] font-semibold text-[#22201D] dark:text-[#F5F2EC] mt-1 tabular-nums">
                  {activeSnapshot.nicheMentionsCount}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#625C53] dark:text-[#B5AFA4]">
                  Creators
                </div>
                <div className="font-mono text-[15px] font-semibold text-[#9A4D09] dark:text-[#FBBF24] mt-1 tabular-nums">
                  {activeSnapshot.activeCreatorsCount}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#625C53] dark:text-[#B5AFA4]">
                  Google Trends
                </div>
                <div className="font-mono text-[15px] font-semibold text-[#1F6F43] dark:text-[#81B64C] mt-1 tabular-nums">
                  {activeSnapshot.googleTrendsRaw}
                  <span className="text-[11px]">/100</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 p-5 rounded-[14px] bg-[#193829] dark:bg-[#1E3326] text-[#F5F2EC] flex flex-col justify-between space-y-3 border border-[#2C5540]">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-[#86EFAC] dark:text-[#81B64C]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{c.outcomeLabel}</span>
              </div>
              <p className="text-[12.5px] text-[#DCE8E0] leading-[1.55]">
                {activeCase.outcome}
              </p>
            </div>

            <div className="pt-3 border-t border-[#2C5540]">
              <div className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#9CC3AD]">
                {c.takeawayLabel}
              </div>
              <p className="text-[12.5px] text-[#FFFFFF] font-medium leading-[1.45] mt-1">
                {activeCase.mediawanLesson}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
