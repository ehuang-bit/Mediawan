import React, { useEffect, useRef, useState } from 'react';
import {
  BookmarkCheck,
  ChevronDown,
  HelpCircle,
  History,
  PanelLeftClose,
  PanelLeftOpen,
  PlugZap,
  Radar,
  RotateCcw,
  Timer,
} from 'lucide-react';
import { AppLang } from '../types';
import { UI_COPY } from '../i18n';
import { SidebarGreenPromoCard } from './OrganicGreenShapes';

export type ActiveMainView = 'radar' | 'watchlist' | 'backtesting';

interface SidebarProps {
  activeView: ActiveMainView;
  isPastTabActive: boolean;
  onSelectRadar: () => void;
  onSelectPastTrends: () => void;
  onSelectView: (view: ActiveMainView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeSignalsCount: number;
  pastTrendsCount: number;
  watchlistCount: number;
  activeApisCount: number;
  onOpenApiManager: () => void;
  onOpenQuickGuide: () => void;
  onResetDemoData: () => void;
  lang: AppLang;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  isPastTabActive,
  onSelectRadar,
  onSelectPastTrends,
  onSelectView,
  collapsed,
  onToggleCollapse,
  activeSignalsCount,
  pastTrendsCount,
  watchlistCount,
  activeApisCount,
  onOpenApiManager,
  onOpenQuickGuide,
  onResetDemoData,
  lang,
}) => {
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const c = UI_COPY[lang];

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setWorkspaceMenuOpen(false);
      }
    }
    if (workspaceMenuOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [workspaceMenuOpen]);

  const radarActive = activeView === 'radar' && !isPastTabActive;
  const pastActive = activeView === 'radar' && isPastTabActive;
  const watchlistActive = activeView === 'watchlist';
  const backtestingActive = activeView === 'backtesting';

  return (
    <aside
      className={`shrink-0 bg-[#F4F0E8] dark:bg-[#1D1B18] border-r border-[#EAE4D9] dark:border-[#3E3B35] flex flex-col justify-between transition-[width,background-color] duration-200 ease-out select-none ${
        collapsed ? 'w-[64px]' : 'w-[232px]'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-[62px] px-4 flex items-center justify-between border-b border-[#EAE4D9] dark:border-[#3E3B35]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-[10px] bg-[#EBF5EE] dark:bg-[#263628] border border-[#CAE5D3] dark:border-[#395439] flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M3 19V5H7.2L12 12.6L16.8 5H21V19H17.4V10.7L13.1 17.5H10.9L6.6 10.7V19H3Z"
                  className="fill-[#1F6F43] dark:fill-[#81B64C]"
                />
              </svg>
            </div>
            {!collapsed && (
              <div className="min-w-0 leading-[1.15]">
                <div className="font-display text-[13.5px] font-bold text-[#22201D] dark:text-[#F5F2EC] truncate">
                  Mediawan
                </div>
                <div className="text-[11.5px] font-medium text-[#625C53] dark:text-[#969085] truncate">
                  {c.brandSub}
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg text-[#8E877D] hover:text-[#22201D] dark:hover:text-[#F5F2EC] hover:bg-[#EAE4D9] dark:hover:bg-[#2E2C28] transition-colors duration-150 shrink-0"
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" strokeWidth={1.75} />
            ) : (
              <PanelLeftClose className="w-4 h-4" strokeWidth={1.75} />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5" aria-label="Primary navigation">
          <button
            type="button"
            onClick={onSelectRadar}
            title={collapsed ? c.navRadar : undefined}
            className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors duration-150 ${
              radarActive
                ? 'bg-[#E4F2E8] dark:bg-[#263628] text-[#1F6F43] dark:text-[#81B64C] font-semibold'
                : 'text-[#4F4A42] dark:text-[#B5AFA4] hover:text-[#22201D] dark:hover:text-[#F5F2EC] hover:bg-[#EAE4D9]/65 dark:hover:bg-[#2E2C28] font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Radar
                className={`w-4 h-4 shrink-0 ${
                  radarActive
                    ? 'text-[#1F6F43] dark:text-[#81B64C]'
                    : 'text-[#736C61] dark:text-[#8E8A81]'
                }`}
                strokeWidth={1.85}
              />
              {!collapsed && (
                <span className="text-[13px] truncate">{c.navRadar}</span>
              )}
            </div>
            {!collapsed && (
              <span
                className={`font-mono text-[11px] px-1.5 py-0.2 rounded-md shrink-0 ${
                  radarActive
                    ? 'text-[#1F6F43] dark:text-[#81B64C] font-semibold'
                    : 'text-[#8E877D]'
                }`}
              >
                {activeSignalsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onSelectPastTrends}
            title={collapsed ? c.navPast : undefined}
            className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors duration-150 ${
              pastActive
                ? 'bg-[#F6EBEB] dark:bg-[#3A2727] text-[#8E3535] dark:text-[#F29C9C] font-semibold'
                : 'text-[#4F4A42] dark:text-[#B5AFA4] hover:text-[#22201D] dark:hover:text-[#F5F2EC] hover:bg-[#EAE4D9]/65 dark:hover:bg-[#2E2C28] font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <History
                className={`w-4 h-4 shrink-0 ${
                  pastActive
                    ? 'text-[#8E3535] dark:text-[#F29C9C]'
                    : 'text-[#736C61] dark:text-[#8E8A81]'
                }`}
                strokeWidth={1.85}
              />
              {!collapsed && (
                <span className="text-[13px] truncate">{c.navPast}</span>
              )}
            </div>
            {!collapsed && (
              <span
                className={`font-mono text-[11px] px-1.5 py-0.2 rounded-md shrink-0 ${
                  pastActive
                    ? 'text-[#8E3535] dark:text-[#F29C9C] font-semibold'
                    : 'text-[#8E877D]'
                }`}
              >
                {pastTrendsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectView('watchlist')}
            title={collapsed ? c.navWatchlist : undefined}
            className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors duration-150 ${
              watchlistActive
                ? 'bg-[#E4F2E8] dark:bg-[#263628] text-[#1F6F43] dark:text-[#81B64C] font-semibold'
                : 'text-[#4F4A42] dark:text-[#B5AFA4] hover:text-[#22201D] dark:hover:text-[#F5F2EC] hover:bg-[#EAE4D9]/65 dark:hover:bg-[#2E2C28] font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <BookmarkCheck
                className={`w-4 h-4 shrink-0 ${
                  watchlistActive
                    ? 'text-[#1F6F43] dark:text-[#81B64C]'
                    : 'text-[#736C61] dark:text-[#8E8A81]'
                }`}
                strokeWidth={1.85}
              />
              {!collapsed && (
                <span className="text-[13px] truncate">{c.navWatchlist}</span>
              )}
            </div>
            {!collapsed && (
              <span
                className={`font-mono text-[11px] px-1.5 py-0.2 rounded-md shrink-0 ${
                  watchlistActive
                    ? 'text-[#1F6F43] dark:text-[#81B64C] font-semibold'
                    : 'text-[#8E877D]'
                }`}
              >
                {watchlistCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectView('backtesting')}
            title={collapsed ? c.navTimeMachine : undefined}
            className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors duration-150 ${
              backtestingActive
                ? 'bg-[#E4F2E8] dark:bg-[#263628] text-[#1F6F43] dark:text-[#81B64C] font-semibold'
                : 'text-[#4F4A42] dark:text-[#B5AFA4] hover:text-[#22201D] dark:hover:text-[#F5F2EC] hover:bg-[#EAE4D9]/65 dark:hover:bg-[#2E2C28] font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Timer
                className={`w-4 h-4 shrink-0 ${
                  backtestingActive
                    ? 'text-[#1F6F43] dark:text-[#81B64C]'
                    : 'text-[#736C61] dark:text-[#8E8A81]'
                }`}
                strokeWidth={1.85}
              />
              {!collapsed && (
                <span className="text-[13px] truncate">{c.navTimeMachine}</span>
              )}
            </div>
            {!collapsed && (
              <span
                className={`font-mono text-[11px] px-1.5 py-0.2 rounded-md shrink-0 ${
                  backtestingActive
                    ? 'text-[#1F6F43] dark:text-[#81B64C] font-semibold'
                    : 'text-[#8E877D]'
                }`}
              >
                3
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenApiManager}
            title={collapsed ? c.navApis : undefined}
            className="w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-left text-[#4F4A42] dark:text-[#B5AFA4] hover:text-[#22201D] dark:hover:text-[#F5F2EC] hover:bg-[#EAE4D9]/65 dark:hover:bg-[#2E2C28] font-medium transition-colors duration-150"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <PlugZap
                className="w-4 h-4 text-[#736C61] dark:text-[#8E8A81] shrink-0"
                strokeWidth={1.85}
              />
              {!collapsed && (
                <span className="text-[13px] truncate">{c.navApis}</span>
              )}
            </div>
            {!collapsed && (
              <span className="font-mono text-[11px] text-[#1F6F43] dark:text-[#81B64C] font-semibold shrink-0">
                {activeApisCount}
              </span>
            )}
          </button>

          {collapsed && (
            <button
              type="button"
              onClick={onOpenQuickGuide}
              title={c.promoCta}
              className="w-full flex items-center justify-center px-3 py-2.5 rounded-xl text-[#4F4A42] dark:text-[#B5AFA4] hover:text-[#22201D] dark:hover:text-[#F5F2EC] hover:bg-[#EAE4D9]/65 dark:hover:bg-[#2E2C28]"
            >
              <HelpCircle className="w-4 h-4" strokeWidth={1.85} />
            </button>
          )}
        </nav>
      </div>

      {/* Bottom Sage Wave Promo Card + Workspace Strip */}
      <div className="space-y-3">
        {!collapsed && (
          <div className="px-3">
            <SidebarGreenPromoCard onClick={onOpenQuickGuide} lang={lang} />
          </div>
        )}

        <div
          className="p-3 border-t border-[#EAE4D9] dark:border-[#3E3B35] relative"
          ref={menuRef}
        >
          <button
            type="button"
            onClick={() => setWorkspaceMenuOpen((o) => !o)}
            className={`w-full flex items-center ${
              collapsed ? 'justify-center p-1.5' : 'justify-between px-2 py-1.5'
            } rounded-xl hover:bg-[#EAE4D9]/75 dark:hover:bg-[#2E2C28] transition-colors`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-full bg-[#E4F2E8] dark:bg-[#263628] border border-[#CAE5D3] dark:border-[#395439] text-[#1F6F43] dark:text-[#81B64C] font-display text-[11.5px] font-bold flex items-center justify-center shrink-0">
                MM
              </span>
              {!collapsed && (
                <span className="text-[13px] font-semibold text-[#22201D] dark:text-[#F5F2EC] truncate">
                  {c.navWorkspace}
                </span>
              )}
            </div>
            {!collapsed && (
              <ChevronDown className="w-3.5 h-3.5 text-[#625C53] dark:text-[#B5AFA4] shrink-0" />
            )}
          </button>

          {workspaceMenuOpen && (
            <div className="absolute left-3 bottom-14 w-[204px] rounded-[12px] bg-[#FFFFFF] dark:bg-[#2E2C28] border border-[#EAE4D9] dark:border-[#3E3B35] shadow-elevated p-1.5 z-50 animate-modal-in">
              <button
                type="button"
                onClick={() => {
                  setWorkspaceMenuOpen(false);
                  onOpenApiManager();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[8px] text-[12.5px] text-[#22201D] dark:text-[#F5F2EC] hover:bg-[#FBF9F4] dark:hover:bg-[#383632] text-left"
              >
                <PlugZap className="w-3.5 h-3.5 text-[#1F6F43] dark:text-[#81B64C]" />
                <span>{c.manageApis}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setWorkspaceMenuOpen(false);
                  onResetDemoData();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[8px] text-[12.5px] text-[#625C53] dark:text-[#B5AFA4] hover:text-[#22201D] dark:hover:text-[#F5F2EC] hover:bg-[#FBF9F4] dark:hover:bg-[#383632] text-left"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{c.resetData}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
