import React, { useState } from 'react';
import {
  HelpCircle,
  History,
  MoreHorizontal,
  PlugZap,
  Radar,
  RotateCcw,
  Timer,
} from 'lucide-react';
import { AppLang } from '../types';
import { UI_COPY } from '../i18n';
import type { ActiveMainView } from './Sidebar';

interface MobileNavProps {
  activeView: ActiveMainView;
  isPastTabActive: boolean;
  onSelectRadar: () => void;
  onSelectPastTrends: () => void;
  onSelectView: (view: ActiveMainView) => void;
  onOpenApiManager: () => void;
  onOpenQuickGuide: () => void;
  onResetDemoData: () => void;
  lang: AppLang;
}

/** Bottom tab bar that replaces the sidebar on small screens. */
export const MobileNav: React.FC<MobileNavProps> = ({
  activeView,
  isPastTabActive,
  onSelectRadar,
  onSelectPastTrends,
  onSelectView,
  onOpenApiManager,
  onOpenQuickGuide,
  onResetDemoData,
  lang,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const c = UI_COPY[lang];

  const tabs = [
    {
      label: c.tabRadar,
      icon: Radar,
      active: activeView === 'radar' && !isPastTabActive,
      onClick: onSelectRadar,
    },
    {
      label: c.tabPast,
      icon: History,
      active: activeView === 'radar' && isPastTabActive,
      onClick: onSelectPastTrends,
    },
    {
      label: c.tabTimeMachine,
      icon: Timer,
      active: activeView === 'backtesting',
      onClick: () => onSelectView('backtesting'),
    },
  ];

  const menuItems = [
    { label: c.manageApis, icon: PlugZap, onClick: onOpenApiManager },
    { label: c.promoCta, icon: HelpCircle, onClick: onOpenQuickGuide },
    { label: c.resetData, icon: RotateCcw, onClick: onResetDemoData },
  ];

  return (
    <nav
      aria-label={c.mobileNavLabel}
      className="md:hidden relative shrink-0 bg-surface border-t-2 border-edge z-30 pb-[env(safe-area-inset-bottom)]"
    >
      {menuOpen && (
        <div className="absolute right-3 bottom-full mb-3 w-[240px] rounded-2xl bg-surface border shadow-elevated p-1.5 animate-modal-in">
          {menuItems.map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onClick();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-[14px] font-medium text-ink hover:bg-canvas text-left"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-5">
        {tabs.map(({ label, icon: Icon, active, onClick }) => (
          <button
            key={label}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => {
              setMenuOpen(false);
              onClick();
            }}
            className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold text-ink"
          >
            <span
              className={`flex items-center justify-center w-12 h-7 rounded-full border-2 ${
                active
                  ? 'bg-pop text-on-pop border-edge'
                  : 'border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
            </span>
            <span className="truncate max-w-full px-1">{label}</span>
          </button>
        ))}
        <button
          type="button"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold text-ink"
        >
          <span
            className={`flex items-center justify-center w-12 h-7 rounded-full border-2 ${
              menuOpen ? 'bg-lilac text-on-pop border-edge' : 'border-transparent'
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </span>
          <span>{c.tabMore}</span>
        </button>
      </div>
    </nav>
  );
};
