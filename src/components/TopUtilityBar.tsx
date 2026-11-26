import React from 'react';
import {
  ChevronRight,
  Clock,
  Database,
  Moon,
  RefreshCw,
  Sun,
  Upload,
} from 'lucide-react';
import { ApiConnectorConfig, AppLang, ThemeMode } from '../types';
import { UI_COPY, tr } from '../i18n';

interface TopUtilityBarProps {
  lastBatchTimestamp: string;
  isRefreshing: boolean;
  onRefreshData: () => void;
  onOpenCsvModal: () => void;
  apiConnectors: ApiConnectorConfig[];
  onOpenApiManager: () => void;
  backendOnline: boolean;
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
  onOpenApiManager,
  backendOnline,
  lang,
  onChangeLang,
  theme,
  onToggleTheme,
}) => {
  const c = UI_COPY[lang];

  const liveCount = apiConnectors.filter((api) => api.status === 'live' && api.enabled).length;

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

        {/* Data sources → opens the Sources window directly */}
        <button
          type="button"
          onClick={onOpenApiManager}
          title={lang === 'fr' ? 'Voir les sources de données' : 'See data sources'}
          className="h-[36px] inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 rounded-full text-[12px] font-semibold bg-surface hover:bg-soft text-ink border border-line transition-colors duration-150"
        >
          <Database className="w-3.5 h-3.5 text-ink-2" />
          <span className="whitespace-nowrap">
            <span className="hidden lg:inline">Sources · </span>
            {liveCount} {lang === 'fr' ? 'en direct' : 'live'}
          </span>
          <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-pop' : 'bg-warn'}`} />
        </button>

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
