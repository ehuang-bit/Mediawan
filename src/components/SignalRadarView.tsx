import { getVerdict, Verdict } from '../utils/verdict';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUp,
  Bookmark,
  ChevronDown,
  Clapperboard,
  FilterX,
  History,
  Layers,
  LayoutGrid,
  LayoutList,
  Palette,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  Users,
  Video,
  X,
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
  VerdictBadge,
  MarketBadge,
  MaturityBadge,
  PillarMiniMeter,
  PlatformMiniBadge,
  WatchlistPill,
} from './SemanticBadges';
import { PlatformBrandIcon } from './PlatformIcons';
import { TrendThumbnail } from './TrendThumbnail';
import { ScoreSparkline } from './ScoreSparkline';
import { RadarEmblemIcon } from './Stickers';
import { RadarMap } from './RadarMap';
import { getTimeGreeting, translateCategory, translateCertainty, UI_COPY, tr } from '../i18n';

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

/** Collected sources first, then platforms only observed. Only platforms present in the data are shown. */
const PLATFORM_ORDER: PlatformSource[] = [
  'YouTube',
  'Wikipedia',
  'Google Trends',
  'Reddit',
  'TikTok',
  'Instagram',
  'Facebook',
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
  /** Top trends of the day / week / month / year (kick-off deliverable) */
  period: PeriodFilter;
  verdict: 'all' | Verdict;
}

export type PeriodFilter = 'all' | 'day' | 'week' | 'month' | 'year';

export const PERIOD_MAX_DAYS: Record<Exclude<PeriodFilter, 'all'>, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
};

/** Shared by the list and the drawer navigation (App.tsx). */
export function matchesPeriodAndVerdict(
  t: MicroTrend,
  filters: Pick<RadarFilterState, 'period' | 'verdict'>,
  isPastTab: boolean,
  lang: AppLang
): boolean {
  if (isPastTab) return true;
  if (filters.period && filters.period !== 'all' && t.daysSinceT0 > PERIOD_MAX_DAYS[filters.period]) {
    return false;
  }
  if (filters.verdict && filters.verdict !== 'all' && getVerdict(t, lang).verdict !== filters.verdict) {
    return false;
  }
  return true;
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
      if (!matchesPeriodAndVerdict(t, filters, isPastTab, lang)) {
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
    if (!isPastTab && filters.period !== 'all') cnt += 1;
    if (!isPastTab && filters.verdict !== 'all') cnt += 1;
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

  const visiblePlatforms = useMemo(() => {
    const present = new Set(trends.flatMap((t) => t.platforms));
    // Keep the bar light: the 6 main sources (others stay searchable in the search box)
    return PLATFORM_ORDER.filter((p) => present.has(p)).slice(0, 6);
  }, [trends]);

  const verdictCounts = useMemo(() => {
    const counts = { act: 0, watch: 0, early: 0 };
    for (const t of activeFuturePool) {
      const v = getVerdict(t, lang).verdict;
      if (v === 'act' || v === 'watch' || v === 'early') counts[v] += 1;
    }
    return counts;
  }, [activeFuturePool, lang]);

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

  const toggleArchetype = (arch: PastArchetypeFilter) =>
    setPastArchetype(pastArchetype === arch ? 'All Eras' : arch);

  const kpiCards = isPastTab
    ? [
        {
          label: c.kpiPastTotal,
          value: pastArchivePool.length,
          tone: 'bg-gold -rotate-1',
          pressed: false,
          onClick: () => setPastArchetype('All Eras'),
        },
        {
          label: c.kpiPastFlash,
          value: pastFlashCount,
          tone: 'bg-pop rotate-1',
          pressed: pastArchetype === 'Viral Flash Wave',
          onClick: () => toggleArchetype('Viral Flash Wave'),
        },
        {
          label: c.kpiPastOther,
          value: pastLongerCount,
          tone: 'bg-lilac -rotate-1',
          pressed: pastArchetype === 'Slang & Creator Era',
          onClick: () => toggleArchetype('Slang & Creator Era'),
        },
      ]
    : [
        {
          label: lang === 'fr' ? 'Signaux actifs (≤ 21 j)' : 'Active signals (≤ 21d)',
          value: activeFuturePool.length,
          tone: 'bg-gold -rotate-1',
          pressed: false,
          onClick: () => onUpdateFilters({ verdict: 'all', maturity: 'All', certainty: 'All' }),
        },
        {
          label: lang === 'fr' ? 'À traiter : Agir' : 'To handle: Act now',
          value: verdictCounts.act,
          tone: 'bg-pop rotate-1',
          pressed: filters.verdict === 'act',
          onClick: () => onUpdateFilters({ verdict: filters.verdict === 'act' ? 'all' : 'act' }),
        },
        {
          label: lang === 'fr' ? 'À surveiller' : 'To watch',
          value: verdictCounts.watch,
          tone: 'bg-lilac -rotate-1',
          pressed: filters.verdict === 'watch',
          onClick: () => onUpdateFilters({ verdict: filters.verdict === 'watch' ? 'all' : 'watch' }),
        },
      ];

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-5 sm:py-6 space-y-5">
      {/* Hero: title + clickable sticker KPIs */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
        <div className="flex items-start gap-4 max-w-[620px]">
          <RadarEmblemIcon mode={isPastTab ? 'past' : 'radar'} />
          <div>
            {!isPastTab && (
              <div className="text-[13px] font-semibold text-accent">
                {greeting}
              </div>
            )}
            <h1 className="font-display text-[34px] sm:text-[42px] font-extrabold text-ink leading-[1.05]">
              {isPastTab ? c.pastTitle : c.radarTitle}
              <span className="text-pop" aria-hidden="true">*</span>
            </h1>
            {isPastTab && (
              <p className="text-[14px] text-ink-2 mt-1 leading-[1.5]">
                {c.pastSubtitle}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 xl:w-[520px] shrink-0">
          {kpiCards.map((kpi) => (
            <button
              key={kpi.label}
              type="button"
              onClick={kpi.onClick}
              aria-pressed={kpi.pressed}
              className={`card-humanist text-left rounded-[18px] border px-3.5 py-3 text-on-pop ${kpi.tone}`}
            >
              <div className="font-display text-[34px] sm:text-[40px] font-extrabold leading-none tabular-nums">
                {kpi.value}
              </div>
              <div className="text-[12px] font-semibold leading-tight mt-1">
                {kpi.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Rounded-Full Category Pills + Separated Past Trends Pill */}
      <div className="no-scrollbar flex items-center overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 py-1">
        <nav className="flex items-center gap-1.5" aria-label={tr('Mediawan vertical themes', lang)}>
          {ACTIVE_CATEGORY_TABS.map(({ id, icon: Icon }) => {
            const isActive = filters.categoryTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onUpdateFilters({ categoryTab: id })}
                className={`px-3.5 py-2 rounded-full text-[12.5px] whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-pop text-on-pop border-edge font-semibold shadow-xs'
                    : 'bg-surface text-ink-2 border-line hover:text-ink hover:border-line font-medium'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{translateCategory(id, lang)}</span>
                <span
                  className={`font-mono text-[11px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-surface/20 text-current'
                      : 'bg-canvas text-ink-2'
                  }`}
                >
                  {categoryCounts[id]}
                </span>
              </button>
            );
          })}

          <span className="h-5 w-[1px] bg-line mx-1 shrink-0" />

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
                ? 'bg-gold text-on-gold border-danger font-semibold shadow-xs'
                : 'bg-danger-soft text-danger border-danger-line hover:border-danger font-medium'
            }`}
          >
            <History className="w-3.5 h-3.5 shrink-0" />
            <span>{translateCategory('Past Trends', lang)}</span>
            <span
              className={`font-mono text-[11px] px-1.5 py-0.2 rounded-full ${
                isPastTab
                  ? 'bg-surface/20 text-current'
                  : 'bg-danger-soft text-danger'
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
                  ? 'bg-gold text-on-gold border-danger'
                  : 'bg-surface text-danger border-danger-line hover:bg-danger-soft'
              }`}
            >
              {archetypeLabel(arch)}
            </button>
          ))}
        </div>
      )}

      {!isPastTab && (
        <RadarMap
          trends={filteredAndSorted}
          selectedTrendId={selectedTrendId}
          onSelectTrend={onSelectTrend}
          lang={lang}
        />
      )}

      {/* Calm Filter Bar with Progressive Disclosure + List/Cards Switcher */}
      <div className="p-4 rounded-[18px] bg-surface border border-line shadow-card space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] basis-full sm:basis-0">
            <Search
              className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
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
              className="w-full h-[42px] pl-10 pr-10 rounded-full bg-soft border border-line focus:border-accent focus:bg-surface focus:outline-none text-[13px] text-ink placeholder:text-ink-3 transition-colors"
            />
            {filters.searchQuery ? (
              <button
                type="button"
                onClick={() => onUpdateFilters({ searchQuery: '' })}
                aria-label={tr('Clear search query', lang)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-2 hover:text-ink"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center justify-center w-5 h-5 rounded-full bg-surface border border-line font-mono text-[11px] text-ink-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                /
              </kbd>
            )}
          </div>

          {/* FR / EN Market Selector */}
          <div
            role="group"
            aria-label={tr('Market language filter', lang)}
            className="h-[42px] inline-flex items-center p-1 rounded-full bg-canvas border border-line"
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
                    ? 'bg-pop text-on-pop'
                    : 'text-ink-2 hover:text-ink'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Period: top trends of the day / week / month / year */}
          {!isPastTab && (
            <div
              role="group"
              aria-label={lang === 'fr' ? 'Période' : 'Period'}
              className="h-[42px] inline-flex items-center p-1 rounded-full bg-canvas border border-line"
            >
              {(
                [
                  { id: 'all', label: lang === 'fr' ? 'Tout' : 'All' },
                  { id: 'day', label: lang === 'fr' ? 'Jour' : 'Day' },
                  { id: 'week', label: lang === 'fr' ? 'Semaine' : 'Week' },
                  { id: 'month', label: lang === 'fr' ? 'Mois' : 'Month' },
                  { id: 'year', label: lang === 'fr' ? 'Année' : 'Year' },
                ] as { id: PeriodFilter; label: string }[]
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onUpdateFilters({ period: p.id })}
                  title={
                    p.id === 'all'
                      ? undefined
                      : lang === 'fr'
                      ? `Apparus depuis ${PERIOD_MAX_DAYS[p.id as Exclude<PeriodFilter, 'all'>]} j max`
                      : `Emerged within ${PERIOD_MAX_DAYS[p.id as Exclude<PeriodFilter, 'all'>]}d`
                  }
                  className={`px-2.5 py-1 rounded-full text-[11.5px] font-semibold transition-colors ${
                    filters.period === p.id ? 'bg-pop text-on-pop' : 'text-ink-2 hover:text-ink'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {!isPastTab && (
            <button
              type="button"
              onClick={() => setWatchlistOnly((w) => !w)}
              className={`h-[42px] inline-flex items-center gap-1.5 px-3.5 rounded-full text-[12.5px] font-medium border transition-colors ${
                watchlistOnly
                  ? 'bg-accent-soft border-accent-line text-accent'
                  : 'bg-surface hover:bg-soft border-line text-ink'
              }`}
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${
                  watchlistOnly
                    ? 'text-accent fill-current'
                    : 'text-ink-2'
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
                ? 'bg-accent-soft border-accent-line text-accent'
                : 'bg-surface hover:bg-soft border-line text-ink'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{c.refineFilters}</span>
            {secondaryRefineCount > 0 && (
              <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-full bg-pop text-on-pop">
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
            aria-label={tr('Layout view', lang)}
            className="h-[42px] inline-flex items-center p-1 rounded-full bg-canvas border border-line"
          >
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold transition-colors ${
                viewMode === 'list'
                  ? 'bg-surface text-ink shadow-xs'
                  : 'text-ink-2 hover:text-ink'
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
                  ? 'bg-surface text-ink shadow-xs'
                  : 'text-ink-2 hover:text-ink'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{c.viewCards}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Secondary Filters Drawer */}
        {refineOpen && (
          <div className="pt-3 border-t border-line grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-modal-in">
            <label className="space-y-1 text-[11px] font-medium text-ink-2">
              <span>{c.audienceFilterLabel}</span>
              <select
                aria-label={tr('Audience', lang)}
                value={filters.persona}
                onChange={(e) =>
                  onUpdateFilters({ persona: e.target.value as PersonaFilter })
                }
                className="w-full h-[36px] px-3 rounded-xl bg-soft border border-line focus:border-accent focus:outline-none text-[12px] font-medium text-ink"
              >
                {PERSONA_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'All Audiences' ? c.audienceAll : tr(opt, lang)}
                  </option>
                ))}
              </select>
            </label>

            {!isPastTab && (
              <label className="space-y-1 text-[11px] font-medium text-ink-2">
                <span>{c.windowFilterLabel}</span>
                <select
                  aria-label={tr('Window', lang)}
                  value={filters.maturity}
                  onChange={(e) =>
                    onUpdateFilters({ maturity: e.target.value as MaturityFilter })
                  }
                  className="w-full h-[36px] px-3 rounded-xl bg-soft border border-line focus:border-accent focus:outline-none text-[12px] font-medium text-ink"
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

            <label className="space-y-1 text-[11px] font-medium text-ink-2">
              <span>{c.certaintyFilterLabel}</span>
              <select
                aria-label={tr('Certainty', lang)}
                value={filters.certainty}
                onChange={(e) =>
                  onUpdateFilters({ certainty: e.target.value as CertaintyFilter })
                }
                className="w-full h-[36px] px-3 rounded-xl bg-soft border border-line focus:border-accent focus:outline-none text-[12px] font-medium text-ink"
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

            <label className="space-y-1 text-[11px] font-medium text-ink-2">
              <span>{c.sortByLabel}</span>
              <select
                aria-label={tr('Sort by', lang)}
                value={filters.sortBy}
                onChange={(e) =>
                  onUpdateFilters({ sortBy: e.target.value as SortOption })
                }
                className="w-full h-[36px] px-3 rounded-xl bg-soft border border-line focus:border-accent focus:outline-none text-[12px] font-medium text-ink"
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
        <div className="pt-3 border-t border-line flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11.5px] font-medium text-ink-2 mr-1">
              {c.platformLabel}
            </span>
            <button
              type="button"
              onClick={() => onUpdateFilters({ platform: 'All' })}
              className={`px-3 py-1 rounded-full text-[11.5px] font-medium transition-colors duration-150 ${
                filters.platform === 'All'
                  ? 'bg-pop text-on-pop'
                  : 'bg-soft text-ink-2 hover:bg-canvas border border-line'
              }`}
            >
              {c.allSources}
            </button>
            {visiblePlatforms.map((plat) => {
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
                      ? 'bg-pop text-on-pop'
                      : 'bg-surface text-ink hover:bg-soft border border-line'
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
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-danger hover:underline"
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
        <div className="rounded-[20px] bg-surface border border-line p-12 text-center shadow-card">
          <div className="text-[15px] font-semibold text-ink">
            {c.noMatchTitle}
          </div>
          <p className="text-[13px] text-ink-2 mt-1">
            {c.noMatchSub}
          </p>
          <button
            type="button"
            onClick={() => {
              setWatchlistOnly(false);
              setPastArchetype('All Eras');
              onResetFilters();
            }}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12.5px] font-semibold bg-pop text-on-pop"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>{c.resetFilters}</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="tilt-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
                className={`card-humanist group rounded-[20px] bg-surface border overflow-hidden cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-accent ring-2 ring-accent/15'
                    : 'border-line shadow-card'
                }`}
              >
                <div>
                  {/* 16:9 Editorial Visual Header */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#1D1D1F]">
                    <TrendThumbnail trend={trend} variant="hero" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#22201D]/80 text-[#FFFFFF] backdrop-blur-xs">
                        #{String(rankNum).padStart(2, '0')}
                      </span>
                      <MarketBadge market={trend.market} />
                      {trend.liveMeta && (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-soft/95 text-accent">
                          <span className="w-1.5 h-1.5 rounded-full bg-pop" />
                          <span>{tr('Live', lang)}</span>
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <VerdictBadge trend={trend} lang={lang} />
                    </div>
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2 text-[#FFFFFF]">
                      <span className="inline-flex items-center gap-1 text-[11.5px] font-medium bg-[#22201D]/75 backdrop-blur-xs px-2.5 py-0.5 rounded-full truncate max-w-[70%]">
                        <UserCheck className="w-3 h-3 shrink-0 text-accent" />
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
                        <span className="font-display text-[17px] font-extrabold text-ink tabular-nums">
                          {trend.emergenceScore}
                        </span>
                        <span
                          className={`font-mono text-[11px] font-semibold tabular-nums ${
                            trend.velocity7d >= 0
                              ? 'text-accent'
                              : 'text-danger'
                          }`}
                        >
                          {trend.velocity7d >= 0
                            ? `+${trend.velocity7d}%`
                            : `${trend.velocity7d}%`}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-display text-[15px] font-bold text-ink group-hover:text-accent transition-colors leading-[1.3]">
                      {trend.title}
                    </h3>

                    <p className="text-[12.5px] text-ink-2 leading-[1.45] line-clamp-2">
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
                <div className="px-4.5 py-3 bg-soft border-t border-line flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CertaintyBadge certainty={trend.certainty} lang={lang} />
                    {!isPastTab && (
                      <WatchlistPill status={trend.watchlistStatus} lang={lang} />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                    {!isPastTab && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickToggleWatchlist(trend);
                        }}
                        aria-label={
                          tr(isShortlisted
                            ? 'Remove from Watchlist'
                            : 'Add to Watchlist', lang)
                        }
                        className={`w-[32px] h-[32px] inline-flex items-center justify-center rounded-full border transition-colors ${
                          isShortlisted
                            ? 'bg-accent-soft border-accent-line text-accent'
                            : 'bg-surface border-line text-ink-2 hover:text-ink'
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
                      className="h-[32px] inline-flex items-center gap-1.5 px-2.5 rounded-full bg-surface border border-line hover:border-accent/40 transition-colors"
                    >
                      <ArrowUp
                        className="w-3 h-3 text-ink"
                        strokeWidth={2.1}
                      />
                      <span className="font-mono text-[12px] font-semibold text-ink tabular-nums">
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
        <div className="rounded-[20px] bg-surface border border-line shadow-card overflow-visible">
          {/* Table Header */}
          <div className="hidden lg:grid lg:grid-cols-[44px_96px_minmax(0,1fr)_126px_174px_118px] gap-4 px-6 py-3.5 bg-soft border-b border-line text-[12px] font-semibold text-ink-2 rounded-t-[20px]">
            <div>#</div>
            <div>{lang === 'fr' ? 'Verdict' : 'Verdict'}</div>
            <div>{isPastTab ? c.colPastTitle : c.colTitle}</div>
            <div className="text-right">{c.colScore}</div>
            <div>{c.colStatus}</div>
            <div className="text-right">{c.colActions}</div>
          </div>

          <div className="divide-y divide-line">
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
                  className={`group relative grid grid-cols-1 lg:grid-cols-[44px_96px_minmax(0,1fr)_126px_174px_118px] gap-3.5 lg:gap-4 items-center px-4 sm:px-6 py-5 cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? 'bg-accent-soft'
                      : 'hover:bg-soft'
                  }`}
                >
                  {isSelected && (
                    <span
                      className={`absolute left-0 top-2 bottom-2 w-[3.5px] rounded-r-full ${
                        isPastTab
                          ? 'bg-gold'
                          : 'bg-pop'
                      }`}
                    />
                  )}

                  {/* 1. Rank & Movement */}
                  <div className="flex lg:flex-col items-baseline lg:items-start gap-2 lg:gap-0.5">
                    <span className="font-mono text-[15px] font-bold text-ink tabular-nums">
                      #{String(rankNum).padStart(2, '0')}
                    </span>
                    {trend.rankMovement.type === 'up' && (
                      <span className="font-mono text-[11px] font-medium text-accent tabular-nums">
                        ▲ +{trend.rankMovement.delta}
                      </span>
                    )}
                    {trend.rankMovement.type === 'down' && (
                      <span className="font-mono text-[11px] font-medium text-danger tabular-nums">
                        ▼ -{trend.rankMovement.delta}
                      </span>
                    )}
                    {trend.rankMovement.type === 'new' && (
                      <span className="font-mono text-[11px] font-semibold text-warn">
                        {tr('NEW', lang)}
                      </span>
                    )}
                    {trend.rankMovement.type === 'same' && (
                      <span className="font-mono text-[11px] text-ink-3">
                        —
                      </span>
                    )}
                  </div>

                  {/* 2. Grade Badge */}
                  <div className="hidden lg:block">
                    <VerdictBadge trend={trend} lang={lang} />
                  </div>

                  {/* 3. Thumbnail + Title + Creator + 2-Line Hook + Badges */}
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 min-w-0">
                    <TrendThumbnail trend={trend} variant="row" />

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <span className="font-display text-[14.5px] font-bold text-ink group-hover:text-accent transition-colors leading-[1.3]">
                          {trend.title}
                        </span>
                        <MarketBadge market={trend.market} />
                        {trend.liveMeta && (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-soft text-accent border border-accent-line shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-pop" />
                            <span>{tr('Live', lang)}</span>
                          </span>
                        )}
                        {!isPastTab && (
                          <WatchlistPill
                            status={trend.watchlistStatus}
                            lang={lang}
                          />
                        )}
                      </div>

                      <p className="text-[12.5px] text-ink-2 leading-[1.45] line-clamp-2">
                        {trend.hook}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent mr-1">
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
                          <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-danger-soft text-danger border border-danger-line truncate max-w-[260px]">
                            {trend.pastEraMetadata.peakScale}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4. Breakout Score + Sparkline + 4-Pillar Meter */}
                  <div
                    className="relative flex flex-col items-start lg:items-end"
                    onMouseEnter={() => setHoveredScoreId(trend.id)}
                    onMouseLeave={() => setHoveredScoreId(null)}
                  >
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-[16px] font-bold text-ink tabular-nums">
                        {trend.emergenceScore}
                      </span>
                      <span
                        className={`font-mono text-[11px] font-medium tabular-nums ${
                          trend.velocity7d >= 0
                            ? 'text-accent'
                            : 'text-danger'
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
                        className="hidden lg:block absolute right-0 bottom-full mb-2 w-[300px] p-3.5 rounded-[14px] bg-surface border border-line shadow-elevated z-40 text-left pointer-events-none"
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-line">
                          <span className="text-[11px] font-semibold text-ink">
                            {c.hoverTitle}
                          </span>
                          <span className="font-mono text-[12px] font-semibold text-accent">
                            {trend.emergenceScore} / 100
                          </span>
                        </div>
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-ink-2">
                              {c.hoverRemix} ({trend.scoreBreakdown.remixes7d})
                            </span>
                            <span className="font-mono font-medium text-ink">
                              {trend.scoreBreakdown.remixVelocity}/30
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-ink-2">
                              {c.hoverCross} ({trend.scoreBreakdown.platformsCrossedDays})
                            </span>
                            <span className="font-mono font-medium text-ink">
                              {trend.scoreBreakdown.crossPlatformJump}/25
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-ink-2">
                              {c.hoverIntent} ({trend.scoreBreakdown.saveShareRatio})
                            </span>
                            <span className="font-mono font-medium text-ink">
                              {trend.scoreBreakdown.audienceIntent}/25
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-ink-2">
                              {c.hoverLift} ({trend.scoreBreakdown.anomalyMultiplier})
                            </span>
                            <span className="font-mono font-medium text-ink">
                              {trend.scoreBreakdown.smallAccountLift}/20
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-line flex items-center justify-between font-mono text-[11px] text-ink-2">
                          <span>
                            {trend.isPastTrend
                              ? c.hoverFooterPast
                              : c.hoverFooterActive}
                          </span>
                          {trend.liveMeta?.wikiViews14d && (
                            <span className="text-accent font-medium">
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
                          tr(isShortlisted
                            ? 'Remove from Watchlist'
                            : 'Add to Watchlist', lang)
                        }
                        className={`w-[34px] h-[34px] inline-flex items-center justify-center rounded-full border transition-colors ${
                          isShortlisted
                            ? 'bg-accent-soft border-accent-line text-accent'
                            : 'bg-soft hover:bg-surface border-line text-ink-2 hover:text-ink'
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
                      className="h-[34px] inline-flex items-center gap-1.5 px-2.5 rounded-full bg-soft hover:bg-surface border border-line hover:border-accent/40 transition-colors"
                    >
                      <ArrowUp
                        className="w-3 h-3 text-ink"
                        strokeWidth={2.1}
                      />
                      <span className="font-mono text-[12px] font-semibold text-ink tabular-nums">
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
