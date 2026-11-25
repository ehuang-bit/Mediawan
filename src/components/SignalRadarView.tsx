import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUp,
  BarChart3,
  Bookmark,
  ChevronDown,
  Clapperboard,
  FilterX,
  History,
  Layers,
  LayoutGrid,
  LayoutList,
  Palette,
  Radar,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  Users,
  Video,
  X,
  Zap,
} from 'lucide-react';
import {
  AppLang,
  CategoryTab,
  CertaintyFilter,
  MarketFilter,
  MaturityFilter,
  MicroTrend,
  PersonaFilter,
  PlatformSource,
  SortOption,
} from '../types';
import {
  CategoryTag,
  CertaintyBadge,
  ColleagueAvatar,
  GradeBadge,
  MarketBadge,
  MaturityBadge,
  PillarMiniMeter,
  PlatformMiniBadge,
  WatchlistPill,
} from './SemanticBadges';
import { PlatformBrandIcon } from './PlatformIcons';
import { TrendThumbnail } from './TrendThumbnail';
import { ScoreSparkline } from './ScoreSparkline';
import { HeroGreenWaveBackdrop, RadarEmblemIcon } from './OrganicGreenShapes';
import {
  getTimeGreeting,
  translateCategory,
  translateCertainty,
  UI_COPY,
} from '../i18n';

const ACTIVE_CATEGORY_TABS: {
  id: Exclude<CategoryTab, 'Past Trends'>;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'All Signals', icon: Layers },
  { id: 'Fiction', icon: Clapperboard },
  { id: 'Animation', icon: Palette },
  { id: 'Documentary', icon: Video },
  { id: 'Entertainment', icon: Sparkles },
  { id: 'Talents', icon: Users },
];

const PERSONA_OPTIONS: PersonaFilter[] = [
  'All Audiences',
  'Kids 9–14',
  'High School 15–18',
  'Gen Z 18–25',
];

const MATURITY_OPTIONS: MaturityFilter[] = [
  'All',
  'Early Spark (1–7d)',
  'Breakout Zone (8–21d)',
];

const CERTAINTY_OPTIONS: CertaintyFilter[] = [
  'All',
  'High Confidence',
  'To Confirm',
  'High Uncertainty',
];

const ALL_PLATFORMS: PlatformSource[] = [
  'TikTok',
  'YouTube',
  'Instagram',
  'Facebook',
  'Reddit',
  'Google Trends',
  'Wattpad/Webtoon',
  'Roblox/Twitch',
];

const SORT_OPTIONS: SortOption[] = [
  'Emergence Score (Default)',
  'Velocity (7d)',
  'Most Team Votes',
  'Newest (t0)',
];

type PastArchetypeFilter =
  | 'All Eras'
  | 'Viral Flash Wave'
  | 'Multi-Year Saga'
  | 'Slang & Creator Era';

export interface RadarFilterState {
  categoryTab: CategoryTab;
  market: MarketFilter;
  searchQuery: string;
  persona: PersonaFilter;
  maturity: MaturityFilter;
  certainty: CertaintyFilter;
  platform: PlatformSource | 'All';
  sortBy: SortOption;
}

interface SignalRadarViewProps {
  trends: MicroTrend[];
  filters: RadarFilterState;
  onUpdateFilters: (patch: Partial<RadarFilterState>) => void;
  onResetFilters: () => void;
  selectedTrendId: string | null;
  onSelectTrend: (
    trendId: string,
    currentRank: number,
    options?: { focusVote?: boolean }
  ) => void;
  onQuickToggleWatchlist: (trend: MicroTrend) => void;
  lang: AppLang;
}

export const SignalRadarView: React.FC<SignalRadarViewProps> = ({
  trends,
  filters,
  onUpdateFilters,
  onResetFilters,
  selectedTrendId,
  onSelectTrend,
  onQuickToggleWatchlist,
  lang,
}) => {
  const [hoveredScoreId, setHoveredScoreId] = useState<string | null>(null);
  const [watchlistOnly, setWatchlistOnly] = useState(false);
  const [refineOpen, setRefineOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [pastArchetype, setPastArchetype] =
    useState<PastArchetypeFilter>('All Eras');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const c = UI_COPY[lang];
  const isPastTab = filters.categoryTab === 'Past Trends';
  const greeting = useMemo(() => getTimeGreeting(lang), [lang]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        target?.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
      searchInputRef.current?.focus();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const activeFuturePool = useMemo(
    () => trends.filter((t) => !t.isPastTrend),
    [trends]
  );
  const pastArchivePool = useMemo(
    () => trends.filter((t) => Boolean(t.isPastTrend)),
    [trends]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryTab, number> = {
      'All Signals': activeFuturePool.length,
      Fiction: 0,
      Animation: 0,
      Documentary: 0,
      Entertainment: 0,
      Talents: 0,
      'Past Trends': pastArchivePool.length,
    };
    for (const t of activeFuturePool) {
      counts[t.category] += 1;
    }
    return counts;
  }, [activeFuturePool, pastArchivePool]);

  const filteredAndSorted = useMemo(() => {
    const q = filters.searchQuery.trim().toLowerCase();
    const basePool = isPastTab ? pastArchivePool : activeFuturePool;

    const matching = basePool.filter((t) => {
      if (!isPastTab && watchlistOnly && t.watchlistStatus === 'Not Tracked') {
        return false;
      }

      if (filters.market === 'FR' && !t.market.includes('FR')) {
        return false;
      }
      if (filters.market === 'EN' && !t.market.includes('EN')) {
        return false;
      }

      if (
        !isPastTab &&
        filters.categoryTab !== 'All Signals' &&
        t.category !== filters.categoryTab
      ) {
        return false;
      }

      if (isPastTab && pastArchetype !== 'All Eras') {
        if (t.pastEraMetadata?.archetype !== pastArchetype) return false;
      }

      if (
        filters.persona !== 'All Audiences' &&
        !t.audiences.includes(filters.persona)
      ) {
        return false;
      }

      if (!isPastTab && filters.maturity !== 'All') {
        if (
          filters.maturity === 'Early Spark (1–7d)' &&
          t.maturity !== 'Early Spark'
        )
          return false;
        if (
          filters.maturity === 'Breakout Zone (8–21d)' &&
          t.maturity !== 'Breakout Zone'
        )
          return false;
      }

      if (filters.certainty !== 'All' && t.certainty !== filters.certainty) {
        return false;
      }

      if (
        filters.platform !== 'All' &&
        !t.platforms.includes(filters.platform)
      ) {
        return false;
      }

      if (q.length > 0) {
        const haystack = [
          t.title,
          t.hook,
          t.category,
          t.market,
          t.viralVideo.creator.handle,
          t.viralVideo.creator.displayName,
          t.pastEraMetadata?.eraLabel ?? '',
          ...t.hashtags,
          ...t.platforms,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q.replace(/^#/, ''))) {
          return false;
        }
      }

      return true;
    });

    return [...matching].sort((a, b) => {
      if (filters.sortBy === 'Velocity (7d)') {
        return b.velocity7d - a.velocity7d;
      }
      if (filters.sortBy === 'Most Team Votes') {
        return (
          b.votes.length - a.votes.length ||
          b.emergenceScore - a.emergenceScore
        );
      }
      if (filters.sortBy === 'Newest (t0)') {
        return a.daysSinceT0 - b.daysSinceT0;
      }
      return b.emergenceScore - a.emergenceScore;
    });
  }, [
    isPastTab,
    pastArchivePool,
    activeFuturePool,
    filters,
    watchlistOnly,
    pastArchetype,
  ]);

  const activeFiltersCount = useMemo(() => {
    let cnt = 0;
    if (filters.market !== 'All') cnt += 1;
    if (filters.persona !== 'All Audiences') cnt += 1;
    if (filters.maturity !== 'All') cnt += 1;
    if (filters.certainty !== 'All') cnt += 1;
    if (filters.platform !== 'All') cnt += 1;
    if (filters.sortBy !== 'Emergence Score (Default)') cnt += 1;
    if (filters.searchQuery.trim() !== '') cnt += 1;
    if (watchlistOnly) cnt += 1;
    if (isPastTab && pastArchetype !== 'All Eras') cnt += 1;
    return cnt;
  }, [filters, watchlistOnly, isPastTab, pastArchetype]);

  const secondaryRefineCount = useMemo(() => {
    let cnt = 0;
    if (filters.persona !== 'All Audiences') cnt += 1;
    if (!isPastTab && filters.maturity !== 'All') cnt += 1;
    if (filters.certainty !== 'All') cnt += 1;
    if (filters.sortBy !== 'Emergence Score (Default)') cnt += 1;
    return cnt;
  }, [filters, isPastTab]);

  const breakoutCount = activeFuturePool.filter(
    (t) => t.maturity === 'Breakout Zone'
  ).length;
  const highConfidenceCount = activeFuturePool.filter(
    (t) => t.certainty === 'High Confidence'
  ).length;

  const pastFlashCount = pastArchivePool.filter(
    (t) => t.pastEraMetadata?.archetype === 'Viral Flash Wave'
  ).length;
  const pastLongerCount = pastArchivePool.length - pastFlashCount;

  const archetypeLabel = (arch: PastArchetypeFilter) => {
    if (arch === 'All Eras') return c.eraAll;
    if (arch === 'Viral Flash Wave') return c.eraFlash;
    if (arch === 'Multi-Year Saga') return c.eraSaga;
    return c.eraSlang;
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-5">
      {/* Warm Humanist Hero Banner with Botanical Green Waves + Clickable KPI Cards */}
      <div className="relative rounded-[22px] bg-[#FFFFFF] dark:bg-[#2E2C28] border border-[#EAE4D9] dark:border-[#3E3B35] p-7 overflow-hidden shadow-card">
        <HeroGreenWaveBackdrop tone={isPastTab ? 'archive' : 'emerald'} />

        <div className="relative z-10 space-y-5">
          <div className="flex items-start gap-4 max-w-[680px]">
            <RadarEmblemIcon mode={isPastTab ? 'past' : 'radar'} />
            <div>
              {!isPastTab && (
                <div className="text-[12.5px] font-semibold text-[#1F6F43] dark:text-[#81B64C] mb-0.5">
                  {greeting}
                </div>
              )}
              <h1 className="font-display text-[26px] font-extrabold text-[#22201D] dark:text-[#F5F2EC] leading-[1.15]">
                {isPastTab ? c.pastTitle : c.radarTitle}
              </h1>
              <p className="text-[13.5px] text-[#625C53] dark:text-[#B5AFA4] mt-1 leading-[1.5]">
                {isPastTab ? c.pastSubtitle : c.radarSubtitle}
              </p>
            </div>
          </div>

          {!isPastTab ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-[720px]">
              <button
                type="button"
                onClick={() =>
                  onUpdateFilters({
                    maturity: 'All',
                    certainty: 'All',
                  })
                }
                className={`card-humanist text-left flex items-center gap-3.5 px-4 py-3.5 rounded-[16px] bg-[#EEF6F0]/95 dark:bg-[#263628]/95 border ${
                  filters.maturity === 'All' && filters.certainty === 'All'
                    ? 'border-[#8AC8A0] dark:border-[#629E47] ring-1 ring-[#1F6F43]/15'
                    : 'border-[#D5E9DB] dark:border-[#395439]'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#FFFFFF]/95 dark:bg-[#1F2C20] flex items-center justify-center shrink-0 shadow-xs">
                  <Radar className="w-4 h-4 text-[#1F6F43] dark:text-[#81B64C]" />
                </div>
                <div>
                  <div className="font-display text-[21px] font-extrabold text-[#22201D] dark:text-[#F5F2EC] leading-none tabular-nums">
                    {activeFuturePool.length}
                  </div>
                  <div className="text-[11.5px] font-semibold text-[#1F6F43] dark:text-[#81B64C] mt-1">
                    {c.kpiFuture}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateFilters({
                    maturity:
                      filters.maturity === 'Breakout Zone (8–21d)'
                        ? 'All'
                        : 'Breakout Zone (8–21d)',
                  })
                }
                className={`card-humanist text-left flex items-center gap-3.5 px-4 py-3.5 rounded-[16px] bg-[#FAF3E8]/95 dark:bg-[#3A2E1E]/95 border ${
                  filters.maturity === 'Breakout Zone (8–21d)'
                    ? 'border-[#DFAD67] dark:border-[#B58237] ring-1 ring-[#B45309]/20'
                    : 'border-[#F0E2CB] dark:border-[#554229]'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#FFFFFF]/95 dark:bg-[#2C2317] flex items-center justify-center shrink-0 shadow-xs">
                  <Zap className="w-4 h-4 text-[#B45309] dark:text-[#FBBF24]" />
                </div>
                <div>
                  <div className="font-display text-[21px] font-extrabold text-[#22201D] dark:text-[#F5F2EC] leading-none tabular-nums">
                    {breakoutCount}
                  </div>
                  <div className="text-[11.5px] font-semibold text-[#B45309] dark:text-[#FBBF24] mt-1">
                    {c.kpiBreakout}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateFilters({
                    certainty:
                      filters.certainty === 'High Confidence'
                        ? 'All'
                        : 'High Confidence',
                  })
                }
                className={`card-humanist text-left flex items-center gap-3.5 px-4 py-3.5 rounded-[16px] bg-[#F0F2FA]/95 dark:bg-[#262B3A]/95 border ${
                  filters.certainty === 'High Confidence'
                    ? 'border-[#9AA8DC] dark:border-[#6A7EC4] ring-1 ring-[#4B5CA8]/20'
                    : 'border-[#E0E5F5] dark:border-[#39415A]'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#FFFFFF]/95 dark:bg-[#1E2330] flex items-center justify-center shrink-0 shadow-xs">
                  <BarChart3 className="w-4 h-4 text-[#4B5CA8] dark:text-[#93A8F5]" />
                </div>
                <div>
                  <div className="font-display text-[21px] font-extrabold text-[#22201D] dark:text-[#F5F2EC] leading-none tabular-nums">
                    {highConfidenceCount}
                  </div>
                  <div className="text-[11.5px] font-semibold text-[#4B5CA8] dark:text-[#93A8F5] mt-1">
                    {c.kpiConfidence}
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-[720px]">
              <button
                type="button"
                onClick={() => setPastArchetype('All Eras')}
                className={`card-humanist text-left flex items-center gap-3.5 px-4 py-3.5 rounded-[16px] bg-[#F8EFEF]/95 dark:bg-[#3A2727]/95 border ${
                  pastArchetype === 'All Eras'
                    ? 'border-[#CFA4A4] dark:border-[#8C5454]'
                    : 'border-[#EAD4D4] dark:border-[#5D3838]'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#FFFFFF]/95 dark:bg-[#2D1E1E] flex items-center justify-center shrink-0 shadow-xs">
                  <History className="w-4 h-4 text-[#8E3535] dark:text-[#F29C9C]" />
                </div>
                <div>
                  <div className="font-display text-[21px] font-extrabold text-[#22201D] dark:text-[#F5F2EC] leading-none tabular-nums">
                    {pastArchivePool.length}
                  </div>
                  <div className="text-[11.5px] font-semibold text-[#8E3535] dark:text-[#F29C9C] mt-1">
                    {c.kpiPastTotal}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setPastArchetype(
                    pastArchetype === 'Viral Flash Wave'
                      ? 'All Eras'
                      : 'Viral Flash Wave'
                  )
                }
                className={`card-humanist text-left flex items-center gap-3.5 px-4 py-3.5 rounded-[16px] bg-[#FAF3E8]/95 dark:bg-[#3A2E1E]/95 border ${
                  pastArchetype === 'Viral Flash Wave'
                    ? 'border-[#DFAD67] dark:border-[#B58237]'
                    : 'border-[#F0E2CB] dark:border-[#554229]'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#FFFFFF]/95 dark:bg-[#2C2317] flex items-center justify-center shrink-0 shadow-xs">
                  <Zap className="w-4 h-4 text-[#B45309] dark:text-[#FBBF24]" />
                </div>
                <div>
                  <div className="font-display text-[21px] font-extrabold text-[#22201D] dark:text-[#F5F2EC] leading-none tabular-nums">
                    {pastFlashCount}
                  </div>
                  <div className="text-[11.5px] font-semibold text-[#B45309] dark:text-[#FBBF24] mt-1">
                    {c.kpiPastFlash}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setPastArchetype(
                    pastArchetype === 'Slang & Creator Era'
                      ? 'All Eras'
                      : 'Slang & Creator Era'
                  )
                }
                className={`card-humanist text-left flex items-center gap-3.5 px-4 py-3.5 rounded-[16px] bg-[#EEF6F0]/95 dark:bg-[#263628]/95 border ${
                  pastArchetype === 'Slang & Creator Era'
                    ? 'border-[#8AC8A0] dark:border-[#629E47]'
                    : 'border-[#D5E9DB] dark:border-[#395439]'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#FFFFFF]/95 dark:bg-[#1F2C20] flex items-center justify-center shrink-0 shadow-xs">
                  <BarChart3 className="w-4 h-4 text-[#1F6F43] dark:text-[#81B64C]" />
                </div>
                <div>
                  <div className="font-display text-[21px] font-extrabold text-[#22201D] dark:text-[#F5F2EC] leading-none tabular-nums">
                    {pastLongerCount}
                  </div>
                  <div className="text-[11.5px] font-semibold text-[#1F6F43] dark:text-[#81B64C] mt-1">
                    {c.kpiPastOther}
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Rounded-Full Category Pills + Separated Past Trends Pill */}
      <div className="flex items-center overflow-x-auto pb-0.5">
        <nav className="flex items-center gap-1.5" aria-label="Mediawan vertical themes">
          {ACTIVE_CATEGORY_TABS.map(({ id, icon: Icon }) => {
            const isActive = filters.categoryTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onUpdateFilters({ categoryTab: id })}
                className={`px-3.5 py-2 rounded-full text-[12.5px] whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-[#1F6F43] dark:bg-[#81B64C] text-[#FFFFFF] dark:text-[#191815] border-[#1F6F43] dark:border-[#81B64C] font-semibold shadow-xs'
                    : 'bg-[#FFFFFF] dark:bg-[#2E2C28] text-[#625C53] dark:text-[#B5AFA4] border-[#EAE4D9] dark:border-[#3E3B35] hover:text-[#22201D] dark:hover:text-[#F5F2EC] hover:border-[#D6CFC2] font-medium'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{translateCategory(id, lang)}</span>
                <span
                  className={`font-mono text-[11px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-[#FFFFFF]/20 dark:bg-[#191815]/15 text-current'
                      : 'bg-[#F4F0E8] dark:bg-[#24221F] text-[#625C53] dark:text-[#B5AFA4]'
                  }`}
                >
                  {categoryCounts[id]}
                </span>
              </button>
            );
          })}

          <span className="h-5 w-[1px] bg-[#DFD8CA] dark:bg-[#3E3B35] mx-1 shrink-0" />

          <button
            type="button"
            onClick={() =>
              onUpdateFilters({
                categoryTab: 'Past Trends',
                maturity: 'All',
              })
            }
            className={`px-3.5 py-2 rounded-full text-[12.5px] whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 border ${
              isPastTab
                ? 'bg-[#8E3535] dark:bg-[#F29C9C] text-[#FFFFFF] dark:text-[#2B1818] border-[#8E3535] dark:border-[#F29C9C] font-semibold shadow-xs'
                : 'bg-[#FBF4F4] dark:bg-[#342626] text-[#7D3A3A] dark:text-[#D5A0A0] border-[#EAD4D4] dark:border-[#5D3838] hover:border-[#CFA4A4] font-medium'
            }`}
          >
            <History className="w-3.5 h-3.5 shrink-0" />
            <span>{translateCategory('Past Trends', lang)}</span>
            <span
              className={`font-mono text-[11px] px-1.5 py-0.2 rounded-full ${
                isPastTab
                  ? 'bg-[#FFFFFF]/20 dark:bg-[#2B1818]/15 text-current'
                  : 'bg-[#F3E4E4] dark:bg-[#2A1D1D] text-[#8E3535] dark:text-[#F29C9C]'
              }`}
            >
              {categoryCounts['Past Trends']}
            </span>
          </button>
        </nav>
      </div>

      {/* Slim Past Era Archetype Filter Bar */}
      {isPastTab && (
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              'All Eras',
              'Viral Flash Wave',
              'Multi-Year Saga',
              'Slang & Creator Era',
            ] as PastArchetypeFilter[]
          ).map((arch) => (
            <button
              key={arch}
              type="button"
              onClick={() => setPastArchetype(arch)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                pastArchetype === arch
                  ? 'bg-[#8E3535] dark:bg-[#F29C9C] text-[#FFFFFF] dark:text-[#2B1818] border-[#8E3535] dark:border-[#F29C9C]'
                  : 'bg-[#FFFFFF] dark:bg-[#2E2C28] text-[#5D2929] dark:text-[#E5B8B8] border-[#EAD4D4] dark:border-[#5D3838] hover:bg-[#FAF0F0] dark:hover:bg-[#3A2727]'
              }`}
            >
              {archetypeLabel(arch)}
            </button>
          ))}
        </div>
      )}

      {/* Calm Filter Bar with Progressive Disclosure + List/Cards Switcher */}
      <div className="p-4 rounded-[18px] bg-[#FFFFFF] dark:bg-[#2E2C28] border border-[#EAE4D9] dark:border-[#3E3B35] shadow-card space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search
              className="w-4 h-4 text-[#8E877D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={1.85}
            />
            <input
              ref={searchInputRef}
              id="radar-keyword-search"
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
              placeholder={
                isPastTab ? c.searchPastPlaceholder : c.searchPlaceholder
              }
              aria-label={c.searchPlaceholder}
              className="w-full h-[42px] pl-10 pr-10 rounded-full bg-[#FBF9F4] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35] focus:border-[#1F6F43] dark:focus:border-[#81B64C] focus:bg-[#FFFFFF] dark:focus:bg-[#22201D] focus:outline-none text-[13px] text-[#22201D] dark:text-[#F5F2EC] placeholder:text-[#8E877D] transition-colors"
            />
            {filters.searchQuery ? (
              <button
                type="button"
                onClick={() => onUpdateFilters({ searchQuery: '' })}
                aria-label="Clear search query"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#625C53] hover:text-[#22201D] dark:hover:text-[#F5F2EC]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FFFFFF] dark:bg-[#2E2C28] border border-[#DFD8CA] dark:border-[#494640] font-mono text-[10px] text-[#8E877D] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                /
              </kbd>
            )}
          </div>

          {/* FR / EN Market Selector */}
          <div
            role="group"
            aria-label="Market language filter"
            className="h-[42px] inline-flex items-center p-1 rounded-full bg-[#F4F0E8] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35]"
          >
            {(
              [
                { id: 'All', label: c.marketAll },
                { id: 'FR', label: 'FR' },
                { id: 'EN', label: 'EN' },
              ] as { id: MarketFilter; label: string }[]
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onUpdateFilters({ market: m.id })}
                className={`px-3 py-1 rounded-full font-mono text-[11px] font-semibold transition-colors ${
                  filters.market === m.id
                    ? 'bg-[#1F6F43] dark:bg-[#81B64C] text-[#FFFFFF] dark:text-[#191815]'
                    : 'text-[#625C53] dark:text-[#B5AFA4] hover:text-[#22201D] dark:hover:text-[#F5F2EC]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {!isPastTab && (
            <button
              type="button"
              onClick={() => setWatchlistOnly((w) => !w)}
              className={`h-[42px] inline-flex items-center gap-1.5 px-3.5 rounded-full text-[12.5px] font-medium border transition-colors ${
                watchlistOnly
                  ? 'bg-[#EBF5EE] dark:bg-[#263628] border-[#CAE5D3] dark:border-[#395439] text-[#1F6F43] dark:text-[#81B64C]'
                  : 'bg-[#FFFFFF] dark:bg-[#24221F] hover:bg-[#FBF9F4] dark:hover:bg-[#33302B] border-[#EAE4D9] dark:border-[#3E3B35] text-[#22201D] dark:text-[#F5F2EC]'
              }`}
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${
                  watchlistOnly
                    ? 'text-[#1F6F43] dark:text-[#81B64C] fill-current'
                    : 'text-[#625C53] dark:text-[#B5AFA4]'
                }`}
              />
              <span>{c.shortlistedBtn}</span>
            </button>
          )}

          {/* Progressive Disclosure Refine Toggle */}
          <button
            type="button"
            onClick={() => setRefineOpen((o) => !o)}
            aria-expanded={refineOpen}
            className={`h-[42px] inline-flex items-center gap-1.5 px-3.5 rounded-full text-[12.5px] font-medium border transition-colors ${
              refineOpen || secondaryRefineCount > 0
                ? 'bg-[#EBF5EE] dark:bg-[#263628] border-[#CAE5D3] dark:border-[#395439] text-[#1F6F43] dark:text-[#81B64C]'
                : 'bg-[#FFFFFF] dark:bg-[#24221F] hover:bg-[#FBF9F4] dark:hover:bg-[#33302B] border-[#EAE4D9] dark:border-[#3E3B35] text-[#22201D] dark:text-[#F5F2EC]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{c.refineFilters}</span>
            {secondaryRefineCount > 0 && (
              <span className="font-mono text-[10.5px] px-1.5 py-0.2 rounded-full bg-[#1F6F43] dark:bg-[#81B64C] text-[#FFFFFF] dark:text-[#191815]">
                {secondaryRefineCount}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-150 ${
                refineOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* List | Cards View Mode Switcher */}
          <div
            role="group"
            aria-label="Layout view"
            className="h-[42px] inline-flex items-center p-1 rounded-full bg-[#F4F0E8] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35]"
          >
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#FFFFFF] dark:bg-[#3A3731] text-[#22201D] dark:text-[#F5F2EC] shadow-xs'
                  : 'text-[#625C53] dark:text-[#B5AFA4] hover:text-[#22201D] dark:hover:text-[#F5F2EC]'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>{c.viewList}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold transition-colors ${
                viewMode === 'cards'
                  ? 'bg-[#FFFFFF] dark:bg-[#3A3731] text-[#22201D] dark:text-[#F5F2EC] shadow-xs'
                  : 'text-[#625C53] dark:text-[#B5AFA4] hover:text-[#22201D] dark:hover:text-[#F5F2EC]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{c.viewCards}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Secondary Filters Drawer */}
        {refineOpen && (
          <div className="pt-3 border-t border-[#EFEAE0] dark:border-[#3E3B35] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-modal-in">
            <label className="space-y-1 text-[11px] font-medium text-[#625C53] dark:text-[#B5AFA4]">
              <span>{c.audienceFilterLabel}</span>
              <select
                aria-label="Audience"
                value={filters.persona}
                onChange={(e) =>
                  onUpdateFilters({ persona: e.target.value as PersonaFilter })
                }
                className="w-full h-[36px] px-3 rounded-xl bg-[#FBF9F4] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35] focus:border-[#1F6F43] focus:outline-none text-[12px] font-medium text-[#22201D] dark:text-[#F5F2EC]"
              >
                {PERSONA_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'All Audiences' ? c.audienceAll : opt}
                  </option>
                ))}
              </select>
            </label>

            {!isPastTab && (
              <label className="space-y-1 text-[11px] font-medium text-[#625C53] dark:text-[#B5AFA4]">
                <span>{c.windowFilterLabel}</span>
                <select
                  aria-label="Window"
                  value={filters.maturity}
                  onChange={(e) =>
                    onUpdateFilters({ maturity: e.target.value as MaturityFilter })
                  }
                  className="w-full h-[36px] px-3 rounded-xl bg-[#FBF9F4] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35] focus:border-[#1F6F43] focus:outline-none text-[12px] font-medium text-[#22201D] dark:text-[#F5F2EC]"
                >
                  {MATURITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === 'All'
                        ? c.windowAll
                        : opt === 'Early Spark (1–7d)'
                        ? c.windowSpark
                        : c.windowBreakout}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="space-y-1 text-[11px] font-medium text-[#625C53] dark:text-[#B5AFA4]">
              <span>{c.certaintyFilterLabel}</span>
              <select
                aria-label="Certainty"
                value={filters.certainty}
                onChange={(e) =>
                  onUpdateFilters({ certainty: e.target.value as CertaintyFilter })
                }
                className="w-full h-[36px] px-3 rounded-xl bg-[#FBF9F4] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35] focus:border-[#1F6F43] focus:outline-none text-[12px] font-medium text-[#22201D] dark:text-[#F5F2EC]"
              >
                {CERTAINTY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'All'
                      ? c.certaintyAll
                      : translateCertainty(opt, lang)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-[11px] font-medium text-[#625C53] dark:text-[#B5AFA4]">
              <span>{c.sortByLabel}</span>
              <select
                aria-label="Sort by"
                value={filters.sortBy}
                onChange={(e) =>
                  onUpdateFilters({ sortBy: e.target.value as SortOption })
                }
                className="w-full h-[36px] px-3 rounded-xl bg-[#FBF9F4] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35] focus:border-[#1F6F43] focus:outline-none text-[12px] font-medium text-[#22201D] dark:text-[#F5F2EC]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'Emergence Score (Default)'
                      ? c.sortScore
                      : opt === 'Velocity (7d)'
                      ? c.sortVelocity
                      : opt === 'Most Team Votes'
                      ? c.sortVotes
                      : c.sortNewest}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {/* Row 2: Social Media Logo Pills */}
        <div className="pt-3 border-t border-[#EFEAE0] dark:border-[#3E3B35] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11.5px] font-medium text-[#625C53] dark:text-[#B5AFA4] mr-1">
              {c.platformLabel}
            </span>
            <button
              type="button"
              onClick={() => onUpdateFilters({ platform: 'All' })}
              className={`px-3 py-1 rounded-full text-[11.5px] font-medium transition-colors duration-150 ${
                filters.platform === 'All'
                  ? 'bg-[#1F6F43] dark:bg-[#81B64C] text-[#FFFFFF] dark:text-[#191815]'
                  : 'bg-[#FBF9F4] dark:bg-[#24221F] text-[#4F4A42] dark:text-[#B5AFA4] hover:bg-[#F4F0E8] dark:hover:bg-[#383632] border border-[#EAE4D9] dark:border-[#3E3B35]'
              }`}
            >
              {c.allSources}
            </button>
            {ALL_PLATFORMS.map((plat) => {
              const active = filters.platform === plat;
              return (
                <button
                  key={plat}
                  type="button"
                  onClick={() =>
                    onUpdateFilters({ platform: active ? 'All' : plat })
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-medium transition-colors duration-150 ${
                    active
                      ? 'bg-[#1F6F43] dark:bg-[#81B64C] text-[#FFFFFF] dark:text-[#191815]'
                      : 'bg-[#FFFFFF] dark:bg-[#24221F] text-[#2C2A26] dark:text-[#E5E2D9] hover:bg-[#FBF9F4] dark:hover:bg-[#383632] border border-[#EAE4D9] dark:border-[#3E3B35]'
                  }`}
                >
                  <PlatformBrandIcon platform={plat} size={13} />
                  <span>{plat}</span>
                </button>
              );
            })}
          </div>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setWatchlistOnly(false);
                setPastArchetype('All Eras');
                onResetFilters();
              }}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#B42318] dark:text-[#F87171] hover:underline"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>
                {c.clearFilters} ({activeFiltersCount})
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State / Ranking List OR Editorial Cards */}
      {filteredAndSorted.length === 0 ? (
        <div className="rounded-[20px] bg-[#FFFFFF] dark:bg-[#2E2C28] border border-[#EAE4D9] dark:border-[#3E3B35] p-12 text-center shadow-card">
          <div className="text-[15px] font-semibold text-[#22201D] dark:text-[#F5F2EC]">
            {c.noMatchTitle}
          </div>
          <p className="text-[13px] text-[#625C53] dark:text-[#B5AFA4] mt-1">
            {c.noMatchSub}
          </p>
          <button
            type="button"
            onClick={() => {
              setWatchlistOnly(false);
              setPastArchetype('All Eras');
              onResetFilters();
            }}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12.5px] font-semibold bg-[#1F6F43] dark:bg-[#81B64C] text-[#FFFFFF] dark:text-[#191815]"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>{c.resetFilters}</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAndSorted.map((trend, index) => {
            const rankNum = index + 1;
            const isSelected = selectedTrendId === trend.id;
            const isShortlisted = trend.watchlistStatus !== 'Not Tracked';

            return (
              <article
                key={trend.id}
                onClick={() => onSelectTrend(trend.id, rankNum)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectTrend(trend.id, rankNum);
                  }
                }}
                role="button"
                tabIndex={0}
                className={`card-humanist group rounded-[20px] bg-[#FFFFFF] dark:bg-[#2E2C28] border overflow-hidden cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#1F6F43] dark:border-[#81B64C] ring-2 ring-[#1F6F43]/15'
                    : 'border-[#EAE4D9] dark:border-[#3E3B35] shadow-card'
                }`}
              >
                <div>
                  {/* 16:9 Editorial Visual Header */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#22201D]">
                    <TrendThumbnail trend={trend} variant="hero" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#22201D]/80 text-[#FFFFFF] backdrop-blur-xs">
                        #{String(rankNum).padStart(2, '0')}
                      </span>
                      <MarketBadge market={trend.market} />
                      {trend.liveMeta && (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF5EE]/95 text-[#1F6F43]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1F6F43]" />
                          <span>Live</span>
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <GradeBadge
                        score={trend.emergenceScore}
                        maturity={trend.maturity}
                      />
                    </div>
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2 text-[#FFFFFF]">
                      <span className="inline-flex items-center gap-1 text-[11.5px] font-medium bg-[#22201D]/75 backdrop-blur-xs px-2.5 py-0.5 rounded-full truncate max-w-[70%]">
                        <UserCheck className="w-3 h-3 shrink-0 text-[#86EFAC]" />
                        <span className="truncate">
                          {c.byCreator} {trend.viralVideo.creator.handle}
                        </span>
                      </span>
                      <span className="font-mono text-[11px] font-semibold bg-[#22201D]/75 px-2 py-0.5 rounded-full shrink-0">
                        {trend.viralVideo.viewsFormatted}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4.5 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <CategoryTag category={trend.category} lang={lang} />
                        <MaturityBadge
                          maturity={trend.maturity}
                          daysSinceT0={trend.daysSinceT0}
                          eraLabel={trend.pastEraMetadata?.eraLabel}
                          compact
                          lang={lang}
                        />
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-display text-[17px] font-extrabold text-[#22201D] dark:text-[#F5F2EC] tabular-nums">
                          {trend.emergenceScore}
                        </span>
                        <span
                          className={`font-mono text-[11px] font-semibold tabular-nums ${
                            trend.velocity7d >= 0
                              ? 'text-[#1F6F43] dark:text-[#81B64C]'
                              : 'text-[#B42318] dark:text-[#F87171]'
                          }`}
                        >
                          {trend.velocity7d >= 0
                            ? `+${trend.velocity7d}%`
                            : `${trend.velocity7d}%`}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-display text-[15px] font-bold text-[#22201D] dark:text-[#F5F2EC] group-hover:text-[#1F6F43] dark:group-hover:text-[#81B64C] transition-colors leading-[1.3]">
                      {trend.title}
                    </h3>

                    <p className="text-[12.5px] text-[#625C53] dark:text-[#B5AFA4] leading-[1.45] line-clamp-2">
                      {trend.hook}
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap items-center gap-1">
                        {trend.platforms.slice(0, 4).map((p) => (
                          <PlatformMiniBadge key={p} platform={p} />
                        ))}
                      </div>
                      <ScoreSparkline
                        id={`card-${trend.id}`}
                        trajectory={trend.trajectory}
                        maturity={trend.maturity}
                        certainty={trend.certainty}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4.5 py-3 bg-[#FBF9F4] dark:bg-[#24221F] border-t border-[#EFEAE0] dark:border-[#3E3B35] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CertaintyBadge certainty={trend.certainty} lang={lang} />
                    {!isPastTab && (
                      <WatchlistPill status={trend.watchlistStatus} lang={lang} />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isPastTab && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickToggleWatchlist(trend);
                        }}
                        aria-label={
                          isShortlisted
                            ? 'Remove from Watchlist'
                            : 'Add to Watchlist'
                        }
                        className={`w-[32px] h-[32px] inline-flex items-center justify-center rounded-full border transition-colors ${
                          isShortlisted
                            ? 'bg-[#EBF5EE] dark:bg-[#263628] border-[#CAE5D3] dark:border-[#395439] text-[#1F6F43] dark:text-[#81B64C]'
                            : 'bg-[#FFFFFF] dark:bg-[#2E2C28] border-[#EAE4D9] dark:border-[#3E3B35] text-[#625C53] dark:text-[#B5AFA4] hover:text-[#22201D]'
                        }`}
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            isShortlisted ? 'fill-current' : ''
                          }`}
                          strokeWidth={1.9}
                        />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTrend(trend.id, rankNum, { focusVote: true });
                      }}
                      className="h-[32px] inline-flex items-center gap-1.5 px-2.5 rounded-full bg-[#FFFFFF] dark:bg-[#2E2C28] border border-[#EAE4D9] dark:border-[#3E3B35] hover:border-[#1F6F43]/40 transition-colors"
                    >
                      <ArrowUp
                        className="w-3 h-3 text-[#22201D] dark:text-[#F5F2EC]"
                        strokeWidth={2.1}
                      />
                      <span className="font-mono text-[12px] font-semibold text-[#22201D] dark:text-[#F5F2EC] tabular-nums">
                        {trend.votes.length}
                      </span>
                      {trend.votes.length > 0 && (
                        <div className="flex -space-x-1 ml-0.5">
                          {trend.votes.slice(0, 2).map((v) => (
                            <ColleagueAvatar
                              key={v.id}
                              initials={v.initials}
                              title={`${v.colleagueName} (${v.pole})`}
                              size="xs"
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[20px] bg-[#FFFFFF] dark:bg-[#2E2C28] border border-[#EAE4D9] dark:border-[#3E3B35] shadow-card overflow-visible">
          {/* Table Header */}
          <div className="hidden lg:grid lg:grid-cols-[44px_38px_minmax(0,1fr)_126px_174px_118px] gap-4 px-6 py-3.5 bg-[#FBF9F4] dark:bg-[#24221F] border-b border-[#EAE4D9] dark:border-[#3E3B35] text-[12px] font-semibold text-[#625C53] dark:text-[#B5AFA4] rounded-t-[20px]">
            <div>#</div>
            <div>Grade</div>
            <div>{isPastTab ? c.colPastTitle : c.colTitle}</div>
            <div className="text-right">{c.colScore}</div>
            <div>{c.colStatus}</div>
            <div className="text-right">{c.colActions}</div>
          </div>

          <div className="divide-y divide-[#EFEAE0] dark:divide-[#3E3B35]">
            {filteredAndSorted.map((trend, index) => {
              const rankNum = index + 1;
              const isSelected = selectedTrendId === trend.id;
              const isScoreHovered = hoveredScoreId === trend.id;
              const isShortlisted = trend.watchlistStatus !== 'Not Tracked';

              return (
                <div
                  key={trend.id}
                  onClick={() => onSelectTrend(trend.id, rankNum)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectTrend(trend.id, rankNum);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`group relative grid grid-cols-1 lg:grid-cols-[44px_38px_minmax(0,1fr)_126px_174px_118px] gap-3.5 lg:gap-4 items-center px-6 py-5 cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? 'bg-[#EEF6F0] dark:bg-[#263628]/60'
                      : 'hover:bg-[#FCFBF8] dark:hover:bg-[#35332E]'
                  }`}
                >
                  {isSelected && (
                    <span
                      className={`absolute left-0 top-2 bottom-2 w-[3.5px] rounded-r-full ${
                        isPastTab
                          ? 'bg-[#8E3535] dark:bg-[#F29C9C]'
                          : 'bg-[#1F6F43] dark:bg-[#81B64C]'
                      }`}
                    />
                  )}

                  {/* 1. Rank & Movement */}
                  <div className="flex lg:flex-col items-baseline lg:items-start gap-2 lg:gap-0.5">
                    <span className="font-mono text-[15px] font-bold text-[#22201D] dark:text-[#F5F2EC] tabular-nums">
                      #{String(rankNum).padStart(2, '0')}
                    </span>
                    {trend.rankMovement.type === 'up' && (
                      <span className="font-mono text-[11px] font-medium text-[#1F6F43] dark:text-[#81B64C] tabular-nums">
                        ▲ +{trend.rankMovement.delta}
                      </span>
                    )}
                    {trend.rankMovement.type === 'down' && (
                      <span className="font-mono text-[11px] font-medium text-[#B42318] dark:text-[#F87171] tabular-nums">
                        ▼ -{trend.rankMovement.delta}
                      </span>
                    )}
                    {trend.rankMovement.type === 'new' && (
                      <span className="font-mono text-[10px] font-semibold text-[#B45309] dark:text-[#FBBF24]">
                        NEW
                      </span>
                    )}
                    {trend.rankMovement.type === 'same' && (
                      <span className="font-mono text-[11px] text-[#8E877D]">
                        —
                      </span>
                    )}
                  </div>

                  {/* 2. Grade Badge */}
                  <div>
                    <GradeBadge
                      score={trend.emergenceScore}
                      maturity={trend.maturity}
                    />
                  </div>

                  {/* 3. Thumbnail + Title + Creator + 2-Line Hook + Badges */}
                  <div className="flex items-start gap-4 min-w-0">
                    <TrendThumbnail trend={trend} variant="row" />

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <span className="font-display text-[14.5px] font-bold text-[#22201D] dark:text-[#F5F2EC] group-hover:text-[#1F6F43] dark:group-hover:text-[#81B64C] transition-colors leading-[1.3]">
                          {trend.title}
                        </span>
                        <MarketBadge market={trend.market} />
                        {trend.liveMeta && (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF5EE] dark:bg-[#263628] text-[#1F6F43] dark:text-[#81B64C] border border-[#CAE5D3] dark:border-[#395439] shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1F6F43] dark:bg-[#81B64C]" />
                            <span>Live</span>
                          </span>
                        )}
                        {!isPastTab && (
                          <WatchlistPill
                            status={trend.watchlistStatus}
                            lang={lang}
                          />
                        )}
                      </div>

                      <p className="text-[12.5px] text-[#625C53] dark:text-[#B5AFA4] leading-[1.45] line-clamp-2">
                        {trend.hook}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1F6F43] dark:text-[#81B64C] mr-1">
                          <UserCheck className="w-3 h-3" />
                          <span>
                            {c.byCreator} {trend.viralVideo.creator.handle}
                          </span>
                        </span>
                        <CategoryTag category={trend.category} lang={lang} />
                        {trend.platforms.map((p) => (
                          <PlatformMiniBadge key={p} platform={p} />
                        ))}
                        {isPastTab && trend.pastEraMetadata && (
                          <span className="font-mono text-[10.5px] px-2.5 py-0.5 rounded-full bg-[#FAF4F4] dark:bg-[#3A2727] text-[#8E3535] dark:text-[#F29C9C] border border-[#EAD4D4] dark:border-[#5D3838] truncate max-w-[260px]">
                            {trend.pastEraMetadata.peakScale}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4. Breakout Score + Sparkline + 4-Pillar Meter */}
                  <div
                    className="relative flex flex-col items-end"
                    onMouseEnter={() => setHoveredScoreId(trend.id)}
                    onMouseLeave={() => setHoveredScoreId(null)}
                  >
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-[16px] font-bold text-[#22201D] dark:text-[#F5F2EC] tabular-nums">
                        {trend.emergenceScore}
                      </span>
                      <span
                        className={`font-mono text-[11px] font-medium tabular-nums ${
                          trend.velocity7d >= 0
                            ? 'text-[#1F6F43] dark:text-[#81B64C]'
                            : 'text-[#B42318] dark:text-[#F87171]'
                        }`}
                      >
                        {trend.velocity7d >= 0
                          ? `+${trend.velocity7d}%`
                          : `${trend.velocity7d}%`}
                      </span>
                    </div>

                    <div className="mt-0.5 space-y-1">
                      <ScoreSparkline
                        id={trend.id}
                        trajectory={trend.trajectory}
                        maturity={trend.maturity}
                        certainty={trend.certainty}
                      />
                      <PillarMiniMeter
                        breakdown={trend.scoreBreakdown}
                        maturity={trend.maturity}
                      />
                    </div>

                    {isScoreHovered && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="hidden lg:block absolute right-0 bottom-full mb-2 w-[300px] p-3.5 rounded-[14px] bg-[#FFFFFF] dark:bg-[#2E2C28] border border-[#EAE4D9] dark:border-[#494640] shadow-elevated z-40 text-left pointer-events-none"
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EAE4D9] dark:border-[#3E3B35]">
                          <span className="text-[11px] font-semibold text-[#22201D] dark:text-[#F5F2EC]">
                            {c.hoverTitle}
                          </span>
                          <span className="font-mono text-[12px] font-semibold text-[#1F6F43] dark:text-[#81B64C]">
                            {trend.emergenceScore} / 100
                          </span>
                        </div>
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#625C53] dark:text-[#B5AFA4]">
                              {c.hoverRemix} ({trend.scoreBreakdown.remixes7d})
                            </span>
                            <span className="font-mono font-medium text-[#22201D] dark:text-[#F5F2EC]">
                              {trend.scoreBreakdown.remixVelocity}/30
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#625C53] dark:text-[#B5AFA4]">
                              {c.hoverCross} ({trend.scoreBreakdown.platformsCrossedDays})
                            </span>
                            <span className="font-mono font-medium text-[#22201D] dark:text-[#F5F2EC]">
                              {trend.scoreBreakdown.crossPlatformJump}/25
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#625C53] dark:text-[#B5AFA4]">
                              {c.hoverIntent} ({trend.scoreBreakdown.saveShareRatio})
                            </span>
                            <span className="font-mono font-medium text-[#22201D] dark:text-[#F5F2EC]">
                              {trend.scoreBreakdown.audienceIntent}/25
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#625C53] dark:text-[#B5AFA4]">
                              {c.hoverLift} ({trend.scoreBreakdown.anomalyMultiplier})
                            </span>
                            <span className="font-mono font-medium text-[#22201D] dark:text-[#F5F2EC]">
                              {trend.scoreBreakdown.smallAccountLift}/20
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-[#EFEAE0] dark:border-[#3E3B35] flex items-center justify-between font-mono text-[10px] text-[#625C53] dark:text-[#B5AFA4]">
                          <span>
                            {trend.isPastTrend
                              ? c.hoverFooterPast
                              : c.hoverFooterActive}
                          </span>
                          {trend.liveMeta?.wikiViews14d && (
                            <span className="text-[#1F6F43] dark:text-[#81B64C] font-medium">
                              {(trend.liveMeta.wikiViews14d / 1000).toFixed(1)}K wiki/14d
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 5. Stacked Window & Certainty */}
                  <div className="flex flex-col items-start gap-1.5 min-w-0">
                    <MaturityBadge
                      maturity={trend.maturity}
                      daysSinceT0={trend.daysSinceT0}
                      eraLabel={trend.pastEraMetadata?.eraLabel}
                      lang={lang}
                    />
                    <CertaintyBadge certainty={trend.certainty} lang={lang} />
                  </div>

                  {/* 6. Actions */}
                  <div className="flex items-center lg:justify-end gap-1.5">
                    {!isPastTab && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickToggleWatchlist(trend);
                        }}
                        aria-label={
                          isShortlisted
                            ? 'Remove from Watchlist'
                            : 'Add to Watchlist'
                        }
                        className={`w-[34px] h-[34px] inline-flex items-center justify-center rounded-full border transition-colors ${
                          isShortlisted
                            ? 'bg-[#EBF5EE] dark:bg-[#263628] border-[#CAE5D3] dark:border-[#395439] text-[#1F6F43] dark:text-[#81B64C]'
                            : 'bg-[#FBF9F4] dark:bg-[#24221F] hover:bg-[#FFFFFF] dark:hover:bg-[#383632] border-[#EAE4D9] dark:border-[#3E3B35] text-[#625C53] dark:text-[#B5AFA4] hover:text-[#22201D] dark:hover:text-[#F5F2EC]'
                        }`}
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            isShortlisted ? 'fill-current' : ''
                          }`}
                          strokeWidth={1.9}
                        />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTrend(trend.id, rankNum, { focusVote: true });
                      }}
                      className="h-[34px] inline-flex items-center gap-1.5 px-2.5 rounded-full bg-[#FBF9F4] dark:bg-[#24221F] hover:bg-[#FFFFFF] dark:hover:bg-[#383632] border border-[#EAE4D9] dark:border-[#3E3B35] hover:border-[#1F6F43]/40 transition-colors"
                    >
                      <ArrowUp
                        className="w-3 h-3 text-[#22201D] dark:text-[#F5F2EC]"
                        strokeWidth={2.1}
                      />
                      <span className="font-mono text-[12px] font-semibold text-[#22201D] dark:text-[#F5F2EC] tabular-nums">
                        {trend.votes.length}
                      </span>
                      {trend.votes.length > 0 && (
                        <div className="flex -space-x-1 ml-0.5">
                          {trend.votes.slice(0, 3).map((v) => (
                            <ColleagueAvatar
                              key={v.id}
                              initials={v.initials}
                              title={`${v.colleagueName} (${v.pole})`}
                              size="xs"
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
