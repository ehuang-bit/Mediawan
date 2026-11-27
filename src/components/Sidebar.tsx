import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  HelpCircle,
  History,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  PlugZap,
  Radar,
  RotateCcw,
  Timer,
} from 'lucide-react';
import { AppLang } from '../types';
import { UI_COPY, tr } from '../i18n';
import { SidebarGuideCard } from './Stickers';
import { MediawanMonogram, MediawanWordmark } from './MediawanLogo';

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
  activeApisCount: number;
  onOpenApiManager: () => void;
  onOpenQuickGuide: () => void;
  onResetDemoData: () => void;
  userEmail?: string;
  userInitials?: string;
  onLogout?: () => void;
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
  activeApisCount,
  onOpenApiManager,
  onOpenQuickGuide,
  onResetDemoData,
  userEmail,
  userInitials,
  onLogout,
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
  const backtestingActive = activeView === 'backtesting';

  return (
    <aside
      className={`shrink-0 bg-canvas border-r-2 border-edge hidden md:flex flex-col justify-between overflow-y-auto transition-[width,background-color] duration-200 ease-out select-none ${
        collapsed ? 'w-[64px]' : 'w-[232px]'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-[62px] px-4 flex items-center justify-between gap-2 border-b border-line">
          <button
            type="button"
            onClick={onSelectRadar}
            title="Mediawan Signal Radar"
            className="flex items-center min-w-0 text-left group cursor-pointer focus:outline-none"
          >
            {collapsed ? (
              <div className="w-8 h-8 rounded-[10px] bg-surface border-[1.5px] border-edge shadow-[2px_2px_0_var(--mw-shadow)] flex items-center justify-center shrink-0">
                <MediawanMonogram className="h-[14px] w-auto text-ink" />
              </div>
            ) : (
              <div className="min-w-0 flex flex-col gap-0.5">
                <MediawanWordmark className="h-[20px] w-auto text-ink group-hover:opacity-80 transition-opacity" />
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-3 truncate">
                  {c.brandSub}
                </span>
              </div>
            )}
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={tr(collapsed ? 'Expand sidebar' : 'Collapse sidebar', lang)}
            title={tr(collapsed ? 'Expand sidebar' : 'Collapse sidebar', lang)}
            className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-line transition-colors duration-150 shrink-0"
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" strokeWidth={1.75} />
            ) : (
              <PanelLeftClose className="w-4 h-4" strokeWidth={1.75} />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5" aria-label={tr('Primary navigation', lang)}>
          <button
            type="button"
            onClick={onSelectRadar}
            title={collapsed ? c.navRadar : undefined}
            className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors duration-150 ${
              radarActive
                ? 'bg-accent-soft text-accent font-semibold'
                : 'text-ink-2 hover:text-ink hover:bg-line/65 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Radar
                className={`w-4 h-4 shrink-0 ${
                  radarActive
                    ? 'text-accent'
                    : 'text-ink-2'
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
                    ? 'text-accent font-semibold'
                    : 'text-ink-3'
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
                ? 'bg-danger-soft text-danger font-semibold'
                : 'text-ink-2 hover:text-ink hover:bg-line/65 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <History
                className={`w-4 h-4 shrink-0 ${
                  pastActive
                    ? 'text-danger'
                    : 'text-ink-2'
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
                    ? 'text-danger font-semibold'
                    : 'text-ink-3'
                }`}
              >
                {pastTrendsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectView('backtesting')}
            title={collapsed ? c.navTimeMachine : undefined}
            className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors duration-150 ${
              backtestingActive
                ? 'bg-accent-soft text-accent font-semibold'
                : 'text-ink-2 hover:text-ink hover:bg-line/65 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Timer
                className={`w-4 h-4 shrink-0 ${
                  backtestingActive
                    ? 'text-accent'
                    : 'text-ink-2'
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
                    ? 'text-accent font-semibold'
                    : 'text-ink-3'
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
            className="w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-left text-ink-2 hover:text-ink hover:bg-line/65 font-medium transition-colors duration-150"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <PlugZap
                className="w-4 h-4 text-ink-2 shrink-0"
                strokeWidth={1.85}
              />
              {!collapsed && (
                <span className="text-[13px] truncate">{c.navApis}</span>
              )}
            </div>
            {!collapsed && (
              <span className="font-mono text-[11px] text-accent font-semibold shrink-0">
                {activeApisCount}
              </span>
            )}
          </button>

          {collapsed && (
            <button
              type="button"
              onClick={onOpenQuickGuide}
              title={c.promoCta}
              className="w-full flex items-center justify-center px-3 py-2.5 rounded-xl text-ink-2 hover:text-ink hover:bg-line/65"
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
            <SidebarGuideCard onClick={onOpenQuickGuide} lang={lang} />
          </div>
        )}

        <div
          className="p-3 border-t border-line relative"
          ref={menuRef}
        >
          <button
            type="button"
            onClick={() => setWorkspaceMenuOpen((o) => !o)}
            className={`w-full flex items-center ${
              collapsed ? 'justify-center p-1.5' : 'justify-between px-2 py-1.5'
            } rounded-xl hover:bg-line/75 transition-colors`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-full bg-accent-soft border border-accent-line text-accent font-display text-[11.5px] font-bold flex items-center justify-center shrink-0">
                {userInitials ?? 'MM'}
              </span>
              {!collapsed && (
                <div className="min-w-0 text-left">
                  <div className="text-[13px] font-semibold text-ink truncate">
                    {c.navWorkspace}
                  </div>
                  {userEmail && (
                    <div className="text-[10.5px] text-ink-3 truncate">
                      {userEmail}
                    </div>
                  )}
                </div>
              )}
            </div>
            {!collapsed && (
              <ChevronDown className="w-3.5 h-3.5 text-ink-2 shrink-0" />
            )}
          </button>

          {workspaceMenuOpen && (
            <div className="absolute left-3 bottom-14 w-[204px] rounded-[12px] bg-surface border border-line shadow-elevated p-1.5 z-50 animate-modal-in">
              <button
                type="button"
                onClick={() => {
                  setWorkspaceMenuOpen(false);
                  onOpenApiManager();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[8px] text-[12.5px] text-ink hover:bg-soft text-left"
              >
                <PlugZap className="w-3.5 h-3.5 text-accent" />
                <span>{c.manageApis}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setWorkspaceMenuOpen(false);
                  onResetDemoData();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[8px] text-[12.5px] text-ink-2 hover:text-ink hover:bg-soft text-left"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{c.resetData}</span>
              </button>
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setWorkspaceMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[8px] text-[12.5px] text-danger hover:bg-danger-soft text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'Déconnexion' : 'Sign out'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
