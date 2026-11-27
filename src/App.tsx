import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { INITIAL_MICRO_TRENDS } from './data/mockTrends';
import { DEFAULT_API_CONNECTORS } from './data/apiConnectors';
import {
  ApiConnectorConfig,
  ApiId,
  AppLang,
  MicroTrend,
  TeamVote,
  ThemeMode,
  WatchlistStatus,
} from './types';
import { ActiveMainView, Sidebar } from './components/Sidebar';
import { TopUtilityBar } from './components/TopUtilityBar';
import {
  matchesPeriodAndVerdict,
  RadarFilterState,
  SignalRadarView,
} from './components/SignalRadarView';
import { GreenlightDrawer } from './components/GreenlightDrawer';
import { BacktestingView } from './components/BacktestingView';
import { CsvImportModal } from './components/CsvImportModal';
import { ApiManagerModal } from './components/ApiManagerModal';
import { QuickGuideModal } from './components/QuickGuideModal';
import { MobileNav } from './components/MobileNav';
import { AuthSession, LoginScreen } from './components/LoginScreen';

const STORAGE_KEYS = {
  TRENDS: 'mediawan_radar_trends_v9',
  FILTERS: 'mediawan_radar_filters_v8',
  SIDEBAR: 'mediawan_radar_sidebar_collapsed_v8',
  VIEW: 'mediawan_radar_active_view_v8',
  BATCH_TS: 'mediawan_radar_batch_ts_v8',
  APIS: 'mediawan_radar_apis_v8',
  LANG: 'mediawan_radar_lang_v8',
  THEME: 'mediawan_radar_theme_v8',
  AUTH: 'mediawan_radar_auth_v1',
};

const DEFAULT_FILTERS: RadarFilterState = {
  categoryTab: 'All Signals',
  market: 'All',
  searchQuery: '',
  persona: 'All Audiences',
  maturity: 'All',
  certainty: 'All',
  platform: 'All',
  sortBy: 'Emergence Score (Default)',
  period: 'all',
  verdict: 'all',
};

function loadStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function formatSyncTimestamp(iso: string | null): string {
  if (!iso) return 'Sync Ready';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Live';
  return (
    d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }) + ' CET'
  );
}

function hydrateStoredTrends(stored: MicroTrend[]): MicroTrend[] {
  const seedById = new Map(INITIAL_MICRO_TRENDS.map((t) => [t.id, t]));
  return stored.map((item) => {
    const seed = seedById.get(item.id);
    if (!seed) return item;
    const isLegacyUrl =
      !item.viralVideo.externalUrl ||
      item.viralVideo.externalUrl.includes('/results?search_query=') ||
      item.viralVideo.externalUrl.includes('/@');
    if (item.viralVideo.thumbnailUrl && !isLegacyUrl) return item;
    return {
      ...item,
      viralVideo: {
        ...item.viralVideo,
        thumbnailUrl: item.viralVideo.thumbnailUrl ?? seed.viralVideo.thumbnailUrl,
        externalUrl: isLegacyUrl ? seed.viralVideo.externalUrl : item.viralVideo.externalUrl,
      },
    };
  });
}

export const App: React.FC = () => {
  const [authSession, setAuthSession] = useState<AuthSession | null>(() =>
    loadStoredJson<AuthSession | null>(STORAGE_KEYS.AUTH, null)
  );

  const [trends, setTrends] = useState<MicroTrend[]>(() =>
    hydrateStoredTrends(
      loadStoredJson<MicroTrend[]>(STORAGE_KEYS.TRENDS, INITIAL_MICRO_TRENDS)
    )
  );

  const [apiConnectors, setApiConnectors] = useState<ApiConnectorConfig[]>(() =>
    loadStoredJson<ApiConnectorConfig[]>(STORAGE_KEYS.APIS, DEFAULT_API_CONNECTORS)
  );

  const [filters, setFilters] = useState<RadarFilterState>(() => ({
    ...DEFAULT_FILTERS,
    ...loadStoredJson<Partial<RadarFilterState>>(STORAGE_KEYS.FILTERS, {}),
  }));

  const [activeView, setActiveView] = useState<ActiveMainView>(() =>
    loadStoredJson<ActiveMainView>(STORAGE_KEYS.VIEW, 'radar') === 'backtesting' ? 'backtesting' : 'radar'
  );

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() =>
    loadStoredJson<boolean>(STORAGE_KEYS.SIDEBAR, false)
  );

  const [lang, setLang] = useState<AppLang>(() =>
    loadStoredJson<AppLang>(STORAGE_KEYS.LANG, 'fr')
  );

  const [theme, setTheme] = useState<ThemeMode>(() =>
    loadStoredJson<ThemeMode>(STORAGE_KEYS.THEME, 'light')
  );

  const [lastBatchTimestamp, setLastBatchTimestamp] = useState<string>(() =>
    loadStoredJson<string>(STORAGE_KEYS.BATCH_TS, 'Sync Ready')
  );

  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [, setSyncStats] = useState({
    youtubeFeedsOk: 0,
    wikiFeedsOk: 0,
    durationMs: 0,
  });

  const [selectedTrendId, setSelectedTrendId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('signal');
  });
  const [selectedRankNumber, setSelectedRankNumber] = useState<
    number | undefined
  >(undefined);
  const [focusVoteTrigger, setFocusVoteTrigger] = useState<number>(0);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [quickGuideOpen, setQuickGuideOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const mainScrollRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
      localStorage.setItem(STORAGE_KEYS.LANG, JSON.stringify(lang));
    } catch {
      // ignore
    }
  }, [theme, lang]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateFromBackend() {
      try {
        const res = await fetch('/api/signals');
        if (!res.ok) return;
        const data = (await res.json()) as {
          trends?: MicroTrend[];
          meta?: {
            lastSyncAt: string | null;
            syncStats?: {
              youtubeFeedsOk: number;
              wikiFeedsOk: number;
              durationMs: number;
            };
          };
        };
        if (cancelled || !Array.isArray(data.trends)) return;

        setBackendOnline(true);
        setTrends(data.trends);
        if (data.meta?.syncStats) setSyncStats(data.meta.syncStats);

        if (data.meta?.lastSyncAt) {
          setLastBatchTimestamp(formatSyncTimestamp(data.meta.lastSyncAt));
        } else {
          const syncRes = await fetch('/api/sync', { method: 'POST' });
          if (syncRes.ok) {
            const syncData = (await syncRes.json()) as {
              trends?: MicroTrend[];
              meta?: {
                lastSyncAt: string | null;
                syncStats?: {
                  youtubeFeedsOk: number;
                  wikiFeedsOk: number;
                  durationMs: number;
                };
              };
            };
            if (!cancelled && Array.isArray(syncData.trends)) {
              setTrends(syncData.trends);
              if (syncData.meta?.syncStats) setSyncStats(syncData.meta.syncStats);
              setLastBatchTimestamp(
                syncData.meta?.lastSyncAt
                  ? formatSyncTimestamp(syncData.meta.lastSyncAt)
                  : 'Live'
              );
            }
          }
        }
      } catch {
        setBackendOnline(false);
      }
    }

    hydrateFromBackend();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRENDS, JSON.stringify(trends));
      localStorage.setItem(STORAGE_KEYS.APIS, JSON.stringify(apiConnectors));
      localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters));
      localStorage.setItem(STORAGE_KEYS.SIDEBAR, JSON.stringify(sidebarCollapsed));
      localStorage.setItem(STORAGE_KEYS.VIEW, JSON.stringify(activeView));
      localStorage.setItem(STORAGE_KEYS.BATCH_TS, JSON.stringify(lastBatchTimestamp));
    } catch {
      // ignore
    }
  }, [trends, apiConnectors, filters, sidebarCollapsed, activeView, lastBatchTimestamp]);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleUpdateFilters = (patch: Partial<RadarFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleResetFilters = () => {
    setFilters((prev) => ({
      ...DEFAULT_FILTERS,
      categoryTab: prev.categoryTab,
    }));
  };

  const handleToggleConnector = (id: ApiId) => {
    setApiConnectors((prev) => {
      const next = prev.map((c) =>
        c.id === id ? { ...c, enabled: !c.enabled } : c
      );
      const toggled = next.find((c) => c.id === id);
      if (toggled) {
        showToast(`${toggled.name} ${toggled.enabled ? 'ON' : 'OFF'}`);
      }
      return next;
    });
  };

  const handleUpdateApiKey = (id: ApiId, key: string) => {
    setApiConnectors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, apiKey: key } : c))
    );
  };

  const handleInjectLiveTrends = (
    liveTrends: MicroTrend[],
    sourceLabel: string
  ) => {
    setTrends((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      const unique = liveTrends.filter((lt) => !existingIds.has(lt.id));
      return [...unique, ...prev];
    });
    fetch('/api/signals/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trends: liveTrends }),
    }).catch(() => {});
    setActiveView('radar');
    setFilters(DEFAULT_FILTERS);
    showToast(`+${liveTrends.length} live (${sourceLabel})`);
  };

  const handleRefreshData = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      if (res.ok) {
        const data = (await res.json()) as {
          trends: MicroTrend[];
          meta: {
            lastSyncAt: string | null;
            syncStats: {
              youtubeFeedsOk: number;
              wikiFeedsOk: number;
              durationMs: number;
            };
          };
        };
        setBackendOnline(true);
        setTrends(data.trends);
        setSyncStats(data.meta.syncStats);
        setLastBatchTimestamp(formatSyncTimestamp(data.meta.lastSyncAt));
        showToast(
          lang === 'fr'
            ? `Sync live OK (${data.meta.syncStats.youtubeFeedsOk} YT · ${data.meta.syncStats.wikiFeedsOk} Wiki)`
            : `Live sync OK (${data.meta.syncStats.youtubeFeedsOk} YT · ${data.meta.syncStats.wikiFeedsOk} Wiki)`
        );
        setIsRefreshing(false);
        return;
      }
    } catch {
      // fallback
    }

    setTimeout(() => {
      setIsRefreshing(false);
      setLastBatchTimestamp('Live');
      showToast(lang === 'fr' ? 'Données actualisées' : 'Snapshot updated');
    }, 600);
  };

  const handleImportTrends = (importedRows: MicroTrend[]) => {
    setTrends((prev) => [...importedRows, ...prev]);
    fetch('/api/signals/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trends: importedRows }),
    }).catch(() => {});
    setActiveView('radar');
    setFilters(DEFAULT_FILTERS);
    showToast(`+${importedRows.length} CSV`);
  };

  const handleChangeWatchlist = (trendId: string, status: WatchlistStatus) => {
    setTrends((prev) =>
      prev.map((t) =>
        t.id === trendId ? { ...t, watchlistStatus: status } : t
      )
    );
    fetch(`/api/signals/${encodeURIComponent(trendId)}/watchlist`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
    showToast(status);
  };

  const handleQuickToggleWatchlist = (trend: MicroTrend) => {
    const nextStatus: WatchlistStatus =
      trend.watchlistStatus === 'Not Tracked' ? 'Monitoring' : 'Not Tracked';
    handleChangeWatchlist(trend.id, nextStatus);
  };

  const handleCastVote = (
    trendId: string,
    voteInput: Omit<TeamVote, 'id' | 'timestamp'>
  ) => {
    const newVote: TeamVote = {
      ...voteInput,
      id: `vote-${Date.now()}`,
      timestamp: lang === 'fr' ? 'À l’instant' : 'Just now',
    };

    setTrends((prev) =>
      prev.map((t) =>
        t.id === trendId ? { ...t, votes: [newVote, ...t.votes] } : t
      )
    );

    fetch(`/api/signals/${encodeURIComponent(trendId)}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voteInput),
    }).catch(() => {});
  };

  const handleClickHashtag = (hashtag: string) => {
    setActiveView('radar');
    setFilters((prev) => ({
      ...prev,
      searchQuery: `#${hashtag}`,
    }));
    setSelectedTrendId(null);
    showToast(`#${hashtag}`);
  };

  const handleResetDemoData = async () => {
    localStorage.removeItem(STORAGE_KEYS.TRENDS);
    localStorage.removeItem(STORAGE_KEYS.FILTERS);
    localStorage.removeItem(STORAGE_KEYS.BATCH_TS);
    localStorage.removeItem(STORAGE_KEYS.APIS);
    setApiConnectors(DEFAULT_API_CONNECTORS);
    setFilters(DEFAULT_FILTERS);
    setSelectedTrendId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('signal');
    window.history.replaceState({}, '', url.toString());
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        const data = (await res.json()) as { trends: MicroTrend[] };
        setTrends(data.trends);
        setLastBatchTimestamp('Baseline');
        showToast(lang === 'fr' ? 'Espace réinitialisé' : 'Workspace reset');
        return;
      }
    } catch {
      // fallback
    }
    setTrends(INITIAL_MICRO_TRENDS);
    setLastBatchTimestamp('Baseline');
    showToast(lang === 'fr' ? 'Espace réinitialisé' : 'Workspace reset');
  };

  const visibleTrends = useMemo(() => {
    const disabledPlatforms = new Set(
      apiConnectors
        .filter((c) => c.status !== 'restricted' && !c.enabled)
        .map((c) => c.platform)
    );
    if (disabledPlatforms.size === 0) return trends;
    return trends.filter((t) =>
      t.platforms.some((p) => !disabledPlatforms.has(p))
    );
  }, [trends, apiConnectors]);

  const orderedRadarIds = useMemo(() => {
    const isPastTab = filters.categoryTab === 'Past Trends';
    const q = filters.searchQuery.trim().toLowerCase();
    const pool = visibleTrends.filter((t) =>
      isPastTab ? Boolean(t.isPastTrend) : !t.isPastTrend
    );
    const matched = pool.filter((t) => {
      if (!matchesPeriodAndVerdict(t, filters, isPastTab, lang)) return false;
      if (filters.market === 'FR' && !t.market.includes('FR')) return false;
      if (filters.market === 'EN' && !t.market.includes('EN')) return false;
      if (
        !isPastTab &&
        filters.categoryTab !== 'All Signals' &&
        t.category !== filters.categoryTab
      )
        return false;
      if (
        filters.persona !== 'All Audiences' &&
        !t.audiences.includes(filters.persona)
      )
        return false;
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
      if (filters.certainty !== 'All' && t.certainty !== filters.certainty)
        return false;
      if (
        filters.platform !== 'All' &&
        !t.platforms.includes(filters.platform)
      )
        return false;
      if (q.length > 0) {
        const hay = [
          t.title,
          t.hook,
          t.category,
          t.market,
          t.viralVideo.creator.handle,
          t.viralVideo.creator.displayName,
          ...t.hashtags,
          ...t.platforms,
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q.replace(/^#/, ''))) return false;
      }
      return true;
    });

    return [...matched]
      .sort((a, b) => {
        if (filters.sortBy === 'Velocity (7d)')
          return b.velocity7d - a.velocity7d;
        if (filters.sortBy === 'Most Team Votes')
          return (
            b.votes.length - a.votes.length ||
            b.emergenceScore - a.emergenceScore
          );
        if (filters.sortBy === 'Newest (t0)')
          return a.daysSinceT0 - b.daysSinceT0;
        return b.emergenceScore - a.emergenceScore;
      })
      .map((t) => t.id);
  }, [visibleTrends, filters, lang]);

  const currentDrawerIndex = selectedTrendId
    ? orderedRadarIds.indexOf(selectedTrendId)
    : -1;
  const canNavigatePrev = currentDrawerIndex > 0;
  const canNavigateNext =
    currentDrawerIndex >= 0 && currentDrawerIndex < orderedRadarIds.length - 1;

  const selectedTrend = useMemo(
    () => visibleTrends.find((t) => t.id === selectedTrendId) ?? null,
    [visibleTrends, selectedTrendId]
  );

  const activeSignalsCount = useMemo(
    () => visibleTrends.filter((t) => !t.isPastTrend).length,
    [visibleTrends]
  );
  const pastTrendsCount = useMemo(
    () => visibleTrends.filter((t) => Boolean(t.isPastTrend)).length,
    [visibleTrends]
  );
  const activeApisCount = useMemo(
    () => apiConnectors.filter((c) => c.status !== 'restricted' && c.enabled).length,
    [apiConnectors]
  );

  const goToView = (view: ActiveMainView) => {
    setActiveView(view);
    mainScrollRef.current?.scrollTo({ top: 0 });
  };

  const goToRadar = () => {
    if (filters.categoryTab === 'Past Trends') {
      handleUpdateFilters({ categoryTab: 'All Signals' });
    }
    goToView('radar');
  };

  const goToPastTrends = () => {
    handleUpdateFilters({ categoryTab: 'Past Trends', maturity: 'All' });
    goToView('radar');
  };

  const handleAuthenticated = (session: AuthSession) => {
    setAuthSession(session);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(session));
    } catch {
      // ignore
    }
    showToast(
      lang === 'fr'
        ? `Connecté : ${session.email}`
        : `Signed in: ${session.email}`
    );
  };

  const handleLogout = () => {
    setAuthSession(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    } catch {
      // ignore
    }
  };

  if (!authSession) {
    return (
      <LoginScreen
        lang={lang}
        onChangeLang={(next) => setLang(next)}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  return (
    <div className="h-dvh flex bg-soft text-ink overflow-hidden transition-colors">
      <Sidebar
        activeView={activeView}
        isPastTabActive={filters.categoryTab === 'Past Trends'}
        onSelectRadar={goToRadar}
        onSelectPastTrends={goToPastTrends}
        onSelectView={goToView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        activeSignalsCount={activeSignalsCount}
        pastTrendsCount={pastTrendsCount}
        activeApisCount={activeApisCount}
        onOpenApiManager={() => setApiModalOpen(true)}
        onOpenQuickGuide={() => setQuickGuideOpen(true)}
        onResetDemoData={handleResetDemoData}
        userEmail={authSession.email}
        userInitials={authSession.initials}
        onLogout={handleLogout}
        lang={lang}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopUtilityBar
          lastBatchTimestamp={lastBatchTimestamp}
          isRefreshing={isRefreshing}
          onRefreshData={handleRefreshData}
          onOpenCsvModal={() => setCsvModalOpen(true)}
          apiConnectors={apiConnectors}
          onOpenApiManager={() => setApiModalOpen(true)}
          backendOnline={backendOnline}
          lang={lang}
          onChangeLang={(next) => {
            setLang(next);
            showToast(next === 'fr' ? 'Langue : Français' : 'Language: English');
          }}
          theme={theme}
          onToggleTheme={() =>
            setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
          }
        />

        <main ref={mainScrollRef} className="flex-1 overflow-y-auto">
          {activeView === 'radar' && (
            <SignalRadarView
              trends={visibleTrends}
              filters={filters}
              onUpdateFilters={handleUpdateFilters}
              onResetFilters={handleResetFilters}
              selectedTrendId={selectedTrendId}
              onSelectTrend={(id, rank, options) => {
                setSelectedTrendId(id);
                setSelectedRankNumber(rank);
                if (options?.focusVote) {
                  setFocusVoteTrigger(Date.now());
                } else {
                  setFocusVoteTrigger(0);
                }
              }}
              onQuickToggleWatchlist={handleQuickToggleWatchlist}
              lang={lang}
            />
          )}

          {activeView === 'backtesting' && <BacktestingView lang={lang} />}
        </main>

        <MobileNav
          activeView={activeView}
          isPastTabActive={filters.categoryTab === 'Past Trends'}
          onSelectRadar={goToRadar}
          onSelectPastTrends={goToPastTrends}
          onSelectView={goToView}
          onOpenApiManager={() => setApiModalOpen(true)}
          onOpenQuickGuide={() => setQuickGuideOpen(true)}
          onResetDemoData={handleResetDemoData}
          lang={lang}
        />
      </div>

      <GreenlightDrawer
        trend={selectedTrend}
        rankNumber={selectedRankNumber}
        focusVoteTrigger={focusVoteTrigger}
        canNavigatePrev={canNavigatePrev}
        canNavigateNext={canNavigateNext}
        onNavigatePrev={() => {
          if (!canNavigatePrev) return;
          const prevIdx = currentDrawerIndex - 1;
          setSelectedTrendId(orderedRadarIds[prevIdx]);
          setSelectedRankNumber(prevIdx + 1);
          setFocusVoteTrigger(0);
        }}
        onNavigateNext={() => {
          if (!canNavigateNext) return;
          const nextIdx = currentDrawerIndex + 1;
          setSelectedTrendId(orderedRadarIds[nextIdx]);
          setSelectedRankNumber(nextIdx + 1);
          setFocusVoteTrigger(0);
        }}
        onClose={() => {
          setSelectedTrendId(null);
          setFocusVoteTrigger(0);
          const url = new URL(window.location.href);
          url.searchParams.delete('signal');
          window.history.replaceState({}, '', url.toString());
        }}
        onChangeWatchlist={handleChangeWatchlist}
        onCastVote={handleCastVote}
        onClickHashtag={handleClickHashtag}
        onShowToast={showToast}
        lang={lang}
      />

      <CsvImportModal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        onImportTrends={handleImportTrends}
        lang={lang}
      />

      <ApiManagerModal
        isOpen={apiModalOpen}
        onClose={() => setApiModalOpen(false)}
        connectors={apiConnectors}
        onToggleConnector={handleToggleConnector}
        onUpdateApiKey={handleUpdateApiKey}
        onInjectLiveTrends={handleInjectLiveTrends}
        lang={lang}
      />

      <QuickGuideModal
        isOpen={quickGuideOpen}
        onClose={() => setQuickGuideOpen(false)}
        lang={lang}
      />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 md:bottom-5 right-4 md:right-5 max-w-[calc(100vw-2rem)] z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-pop text-on-pop text-[12.5px] font-semibold shadow-elevated animate-modal-in"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
