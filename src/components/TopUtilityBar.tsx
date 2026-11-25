import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronRight,
  Clock,
  Database,
  Moon,
  RefreshCw,
  Settings2,
  Sun,
  Upload,
} from 'lucide-react';
import { ApiConnectorConfig, ApiId, AppLang, ThemeMode } from '../types';
import { PlatformBrandIcon } from './PlatformIcons';
import { UI_COPY, tr } from '../i18n';

interface TopUtilityBarProps {
  lastBatchTimestamp: string;
  isRefreshing: boolean;
  onRefreshData: () => void;
  onOpenCsvModal: () => void;
  apiConnectors: ApiConnectorConfig[];
  onToggleConnector: (id: ApiId) => void;
  onOpenApiManager: () => void;
  backendOnline: boolean;
  syncStats: {
    youtubeFeedsOk: number;
    wikiFeedsOk: number;
    durationMs: number;
  };
  lang: AppLang;
  onChangeLang: (lang: AppLang) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const TopUtilityBar: React.FC<TopUtilityBarProps> = ({
  lastBatchTimestamp,
  isRefreshing,
  onRefreshData,
  onOpenCsvModal,
  apiConnectors,
  onToggleConnector,
  onOpenApiManager,
  backendOnline,
  syncStats,
  lang,
  onChangeLang,
  theme,
  onToggleTheme,
}) => {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const c = UI_COPY[lang];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setSourcesOpen(false);
      }
    }
    if (sourcesOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sourcesOpen]);

  const activeCount = apiConnectors.filter((api) => api.enabled).length;

  return (
    <header className="h-[62px] px-3 sm:px-6 bg-surface/90 backdrop-blur-md border-b-2 border-edge flex items-center justify-between gap-2 sm:gap-4 shrink-0 z-20 transition-colors">
      {/* Warm Sentence-Case Breadcrumb (no duplicate subtitle) */}
      <div className="md:hidden font-extrabold text-[18px] text-ink whitespace-nowrap">
        radar<span className="text-pop">*</span>
      </div>
      <div className="hidden md:flex items-center gap-2 min-w-0 text-[12.5px] text-ink-2">
        <span className="font-medium shrink-0">
          {c.breadcrumbInternal}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-surface shrink-0" />
        <span className="font-display font-bold text-ink shrink-0">
          {c.breadcrumbBrand}
        </span>
      </div>

      {/* Right Controls: EN|FR Switcher · Theme Toggle · Social APIs · Timestamp · Sync · Import CSV */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* EN | FR Switcher */}
        <div
          role="group"
          aria-label={tr('Language', lang)}
          className="h-[36px] inline-flex items-center p-0.5 rounded-full bg-canvas border border-line"
        >
          <button
            type="button"
            onClick={() => onChangeLang('en')}
            className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-semibold transition-colors ${
              lang === 'en'
                ? 'bg-surface text-ink shadow-xs'
                : 'text-ink-2 hover:text-ink'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onChangeLang('fr')}
            className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-semibold transition-colors ${
              lang === 'fr'
                ? 'bg-surface text-ink shadow-xs'
                : 'text-ink-2 hover:text-ink'
            }`}
          >
            FR
          </button>
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={tr(theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode', lang)}
          aria-label={tr(theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode', lang)}
          className="w-[36px] h-[36px] inline-flex items-center justify-center rounded-full bg-surface hover:bg-soft text-ink border border-line transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-warn" strokeWidth={1.85} />
          ) : (
            <Moon className="w-4 h-4 text-ink-2" strokeWidth={1.85} />
          )}
        </button>

        {/* Connected Social APIs */}
        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setSourcesOpen((prev) => !prev)}
            className="h-[36px] inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 rounded-full text-[12px] font-semibold bg-surface hover:bg-soft text-ink border border-line transition-colors duration-150"
          >
            <span className="whitespace-nowrap">
              {activeCount}
              <span className="hidden lg:inline"> {c.socialApisBtn}</span>
              <span className="lg:hidden"> API</span>
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? 'bg-pop' : 'bg-warn'
              }`}
            />
          </button>

          {sourcesOpen && (
            <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-[62px] sm:top-auto mt-2 sm:w-[372px] max-h-[70dvh] overflow-y-auto rounded-[16px] bg-surface border border-line shadow-elevated p-4 z-50 animate-modal-in">
              <div className="flex items-center justify-between pb-2.5 border-b border-line">
                <span className="text-[13px] font-semibold text-ink">
                  {c.connectedApis}
                </span>
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-accent-soft text-accent">
                  {activeCount} / {apiConnectors.length} ON
                </span>
              </div>

              <div className="mt-2.5 p-2.5 rounded-[12px] bg-soft border border-accent-line flex items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2 min-w-0">
                  <Database className="w-3.5 h-3.5 text-accent shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-accent truncate">
                      {backendOnline ? c.nodeBackendOn : c.localFallback}
                    </div>
                    <div className="font-mono text-[11px] text-accent truncate">
                      {syncStats.youtubeFeedsOk > 0 || syncStats.wikiFeedsOk > 0
                        ? `Live: ${syncStats.youtubeFeedsOk} YT Atom · ${syncStats.wikiFeedsOk} Wiki REST (${syncStats.durationMs}ms)`
                        : 'YouTube Atom RSS + Wikimedia REST'}
                    </div>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-pop shrink-0" />
              </div>

              <div className="py-2.5 space-y-1.5">
                {apiConnectors.map((api) => (
                  <div
                    key={api.id}
                    className="flex items-center justify-between gap-3 p-2 rounded-[10px] hover:bg-soft transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PlatformBrandIcon platform={api.platform} size={16} />
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-medium text-ink truncate">
                          {api.name}
                        </div>
                        <div className="text-[11px] text-ink-2 truncate">
                          {api.endpointLabel}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={api.enabled}
                      aria-label={`Toggle ${api.name}`}
                      onClick={() => onToggleConnector(api.id)}
                      className={`relative w-9 h-5 rounded-full transition-colors duration-150 shrink-0 ${
                        api.enabled
                          ? 'bg-pop'
                          : 'bg-line'
                      }`}
                    >
                      <span
                        className={`block w-3.5 h-3.5 rounded-full bg-[#FFFFFF] shadow transition-transform duration-150 ${
                          api.enabled ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2.5 border-t border-line flex items-center justify-between">
                <span className="font-mono text-[11px] text-ink-2">
                  {tr(lastBatchTimestamp, lang)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSourcesOpen(false);
                    onOpenApiManager();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold bg-pop hover:opacity-90 text-on-pop transition-colors"
                >
                  <Settings2 className="w-3 h-3" />
                  <span>{c.manageKeys}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="hidden xl:inline-flex h-[36px] items-center gap-1.5 px-3.5 rounded-full bg-soft border border-line font-mono text-[11.5px] text-ink-2">
          <Clock className="w-3.5 h-3.5 text-ink-3" />
          <span>{tr(lastBatchTimestamp, lang)}</span>
        </span>

        {/* Sync */}
        <button
          type="button"
          onClick={onRefreshData}
          disabled={isRefreshing}
          title={c.syncBtnTitle}
          aria-label={c.syncBtnTitle}
          className="w-[36px] h-[36px] inline-flex items-center justify-center rounded-full bg-surface hover:bg-soft active:scale-[0.97] text-ink border border-line disabled:opacity-60 transition-[background-color,transform] duration-150"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              isRefreshing
                ? 'animate-spin text-accent'
                : 'text-ink'
            }`}
            strokeWidth={1.85}
          />
        </button>

        {/* Import CSV */}
        <button
          type="button"
          onClick={onOpenCsvModal}
          aria-label={c.importCsv}
          className="h-[36px] inline-flex items-center justify-center gap-1.5 w-[36px] sm:w-auto sm:px-4 rounded-full text-[12.5px] font-semibold bg-pop hover:bg-pop-hover text-on-pop active:scale-[0.98] transition-[background-color,transform] duration-150 shadow-xs"
        >
          <Upload className="w-3.5 h-3.5" strokeWidth={2} />
          <span className="hidden sm:inline whitespace-nowrap">{c.importCsv}</span>
        </button>
      </div>
    </header>
  );
};
