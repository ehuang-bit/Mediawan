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
import { UI_COPY } from '../i18n';

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
    <header className="h-[62px] px-6 bg-[#FFFFFF]/90 dark:bg-[#1D1B18]/90 backdrop-blur-md border-b border-[#EAE4D9] dark:border-[#3E3B35] flex items-center justify-between gap-4 shrink-0 z-20 transition-colors">
      {/* Warm Sentence-Case Breadcrumb (no duplicate subtitle) */}
      <div className="flex items-center gap-2 min-w-0 text-[12.5px] text-[#625C53] dark:text-[#B5AFA4]">
        <span className="font-medium shrink-0">
          {c.breadcrumbInternal}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-[#C8C0B2] dark:text-[#55524B] shrink-0" />
        <span className="font-display font-bold text-[#22201D] dark:text-[#F5F2EC] shrink-0">
          {c.breadcrumbBrand}
        </span>
      </div>

      {/* Right Controls: EN|FR Switcher · Theme Toggle · Social APIs · Timestamp · Sync · Import CSV */}
      <div className="flex items-center gap-2 shrink-0">
        {/* EN | FR Switcher */}
        <div
          role="group"
          aria-label="Language"
          className="h-[36px] inline-flex items-center p-0.5 rounded-full bg-[#F4F0E8] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35]"
        >
          <button
            type="button"
            onClick={() => onChangeLang('en')}
            className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-semibold transition-colors ${
              lang === 'en'
                ? 'bg-[#FFFFFF] dark:bg-[#3A3731] text-[#22201D] dark:text-[#F5F2EC] shadow-xs'
                : 'text-[#625C53] dark:text-[#969085] hover:text-[#22201D] dark:hover:text-[#F5F2EC]'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onChangeLang('fr')}
            className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-semibold transition-colors ${
              lang === 'fr'
                ? 'bg-[#FFFFFF] dark:bg-[#3A3731] text-[#22201D] dark:text-[#F5F2EC] shadow-xs'
                : 'text-[#625C53] dark:text-[#969085] hover:text-[#22201D] dark:hover:text-[#F5F2EC]'
            }`}
          >
            FR
          </button>
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="w-[36px] h-[36px] inline-flex items-center justify-center rounded-full bg-[#FFFFFF] dark:bg-[#24221F] hover:bg-[#FBF9F4] dark:hover:bg-[#33302B] text-[#22201D] dark:text-[#F5F2EC] border border-[#EAE4D9] dark:border-[#3E3B35] transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[#FBBF24]" strokeWidth={1.85} />
          ) : (
            <Moon className="w-4 h-4 text-[#625C53]" strokeWidth={1.85} />
          )}
        </button>

        {/* Connected Social APIs */}
        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setSourcesOpen((prev) => !prev)}
            className="h-[36px] inline-flex items-center gap-2 px-3.5 rounded-full text-[12px] font-semibold bg-[#FFFFFF] dark:bg-[#24221F] hover:bg-[#FBF9F4] dark:hover:bg-[#33302B] text-[#22201D] dark:text-[#F5F2EC] border border-[#EAE4D9] dark:border-[#3E3B35] transition-colors duration-150"
          >
            <span>
              {activeCount} {c.socialApisBtn}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? 'bg-[#1F6F43] dark:bg-[#81B64C]' : 'bg-[#B45309]'
              }`}
            />
          </button>

          {sourcesOpen && (
            <div className="absolute right-0 mt-2 w-[372px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#2E2C28] border border-[#EAE4D9] dark:border-[#3E3B35] shadow-elevated p-4 z-50 animate-modal-in">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#EAE4D9] dark:border-[#3E3B35]">
                <span className="text-[13px] font-semibold text-[#22201D] dark:text-[#F5F2EC]">
                  {c.connectedApis}
                </span>
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#EBF5EE] dark:bg-[#263628] text-[#1F6F43] dark:text-[#81B64C]">
                  {activeCount} / {apiConnectors.length} ON
                </span>
              </div>

              <div className="mt-2.5 p-2.5 rounded-[12px] bg-[#F4F8F5] dark:bg-[#263527] border border-[#D4E9DA] dark:border-[#395439] flex items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2 min-w-0">
                  <Database className="w-3.5 h-3.5 text-[#1F6F43] dark:text-[#81B64C] shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-[#153622] dark:text-[#EDF7EC] truncate">
                      {backendOnline ? c.nodeBackendOn : c.localFallback}
                    </div>
                    <div className="font-mono text-[10px] text-[#2F5B40] dark:text-[#B5D6B7] truncate">
                      {syncStats.youtubeFeedsOk > 0 || syncStats.wikiFeedsOk > 0
                        ? `Live: ${syncStats.youtubeFeedsOk} YT Atom · ${syncStats.wikiFeedsOk} Wiki REST (${syncStats.durationMs}ms)`
                        : 'YouTube Atom RSS + Wikimedia REST'}
                    </div>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#1F6F43] dark:bg-[#81B64C] shrink-0" />
              </div>

              <div className="py-2.5 space-y-1.5">
                {apiConnectors.map((api) => (
                  <div
                    key={api.id}
                    className="flex items-center justify-between gap-3 p-2 rounded-[10px] hover:bg-[#FBF9F4] dark:hover:bg-[#383632] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PlatformBrandIcon platform={api.platform} size={16} />
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-medium text-[#22201D] dark:text-[#F5F2EC] truncate">
                          {api.name}
                        </div>
                        <div className="text-[11px] text-[#625C53] dark:text-[#B5AFA4] truncate">
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
                          ? 'bg-[#1F6F43] dark:bg-[#81B64C]'
                          : 'bg-[#D9D1C3] dark:bg-[#4A4741]'
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

              <div className="pt-2.5 border-t border-[#EAE4D9] dark:border-[#3E3B35] flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#625C53] dark:text-[#B5AFA4]">
                  {lastBatchTimestamp}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSourcesOpen(false);
                    onOpenApiManager();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold bg-[#1F6F43] dark:bg-[#81B64C] dark:text-[#16181A] hover:opacity-90 text-[#FFFFFF] transition-colors"
                >
                  <Settings2 className="w-3 h-3" />
                  <span>{c.manageKeys}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="hidden xl:inline-flex h-[36px] items-center gap-1.5 px-3.5 rounded-full bg-[#FBF9F4] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35] font-mono text-[11.5px] text-[#625C53] dark:text-[#B5AFA4]">
          <Clock className="w-3.5 h-3.5 text-[#8E877D]" />
          <span>{lastBatchTimestamp}</span>
        </span>

        {/* Sync */}
        <button
          type="button"
          onClick={onRefreshData}
          disabled={isRefreshing}
          title={c.syncBtnTitle}
          aria-label={c.syncBtnTitle}
          className="w-[36px] h-[36px] inline-flex items-center justify-center rounded-full bg-[#FFFFFF] dark:bg-[#24221F] hover:bg-[#FBF9F4] dark:hover:bg-[#33302B] active:scale-[0.97] text-[#22201D] dark:text-[#F5F2EC] border border-[#EAE4D9] dark:border-[#3E3B35] disabled:opacity-60 transition-[background-color,transform] duration-150"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              isRefreshing
                ? 'animate-spin text-[#1F6F43] dark:text-[#81B64C]'
                : 'text-[#22201D] dark:text-[#F5F2EC]'
            }`}
            strokeWidth={1.85}
          />
        </button>

        {/* Import CSV */}
        <button
          type="button"
          onClick={onOpenCsvModal}
          className="h-[36px] inline-flex items-center gap-1.5 px-4 rounded-full text-[12.5px] font-semibold bg-[#1F6F43] hover:bg-[#185B36] dark:bg-[#81B64C] dark:hover:bg-[#93C75D] text-[#FFFFFF] dark:text-[#191815] active:scale-[0.98] transition-[background-color,transform] duration-150 shadow-xs"
        >
          <Upload className="w-3.5 h-3.5" strokeWidth={2} />
          <span>{c.importCsv}</span>
        </button>
      </div>
    </header>
  );
};
