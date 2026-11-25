import React from 'react';
import { ArrowRight, ArrowUp, Plus } from 'lucide-react';
import { AppLang, MicroTrend, WatchlistStatus } from '../types';
import {
  CategoryTag,
  CertaintyBadge,
  GradeBadge,
  MarketBadge,
  MaturityBadge,
} from './SemanticBadges';
import { HeroGreenWaveBackdrop } from './OrganicGreenShapes';
import { translateWatchlist, UI_COPY } from '../i18n';

interface EditorialWatchlistViewProps {
  trends: MicroTrend[];
  onSelectTrend: (trendId: string) => void;
  onChangeWatchlist: (trendId: string, status: WatchlistStatus) => void;
  onSwitchToRadar: () => void;
  lang: AppLang;
}

const COLUMNS: {
  status: Exclude<WatchlistStatus, 'Not Tracked'>;
  accentDot: string;
  nextStatus?: WatchlistStatus;
}[] = [
  {
    status: 'Monitoring',
    accentDot: '#4B5CA8',
    nextStatus: 'Under Review',
  },
  {
    status: 'Under Review',
    accentDot: '#B45309',
    nextStatus: 'Outreach Started',
  },
  {
    status: 'Outreach Started',
    accentDot: '#1B6E3E',
  },
];

export const EditorialWatchlistView: React.FC<EditorialWatchlistViewProps> = ({
  trends,
  onSelectTrend,
  onChangeWatchlist,
  onSwitchToRadar,
  lang,
}) => {
  const c = UI_COPY[lang];
  const activeOnly = trends.filter((t) => !t.isPastTrend);
  const untracked = activeOnly.filter((t) => t.watchlistStatus === 'Not Tracked');

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-5">
      <div className="relative rounded-[20px] bg-[#FFFFFF] dark:bg-[#2E2C28] border border-[#EAE4D9] dark:border-[#3E3B35] p-6 overflow-hidden shadow-card flex flex-wrap items-center justify-between gap-4">
        <HeroGreenWaveBackdrop compact />
        <div className="relative z-10">
          <h1 className="font-display text-[24px] font-extrabold text-[#22201D] dark:text-[#F5F2EC]">
            {c.watchlistTitle}
          </h1>
          <p className="text-[13px] text-[#625C53] dark:text-[#B5AFA4] mt-1">
            {c.watchlistSub}
          </p>
        </div>

        <button
          type="button"
          onClick={onSwitchToRadar}
          className="relative z-10 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] font-semibold bg-[#FFFFFF]/95 dark:bg-[#24221F] hover:bg-[#F4F0E8] dark:hover:bg-[#383632] text-[#22201D] dark:text-[#F5F2EC] border border-[#EAE4D9] dark:border-[#3E3B35] transition-colors"
        >
          <span>{c.backToRadar}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Pipeline Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {COLUMNS.map((col) => {
          const items = activeOnly
            .filter((t) => t.watchlistStatus === col.status)
            .sort((a, b) => b.emergenceScore - a.emergenceScore);

          return (
            <div
              key={col.status}
              className="rounded-[18px] bg-[#F4F0E8] dark:bg-[#1D1B18] border border-[#EAE4D9] dark:border-[#3E3B35] p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#EAE4D9] dark:border-[#3E3B35]">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: col.accentDot }}
                  />
                  <h2 className="font-display text-[13.5px] font-bold text-[#22201D] dark:text-[#F5F2EC] leading-none">
                    {translateWatchlist(col.status, lang)}
                  </h2>
                </div>
                <span className="font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFFFFF] dark:bg-[#2E2C28] text-[#22201D] dark:text-[#F5F2EC] border border-[#EAE4D9] dark:border-[#3E3B35]">
                  {items.length}
                </span>
              </div>

              {items.length === 0 ? (
                <div className="p-6 rounded-[14px] bg-[#FFFFFF] dark:bg-[#2E2C28] border border-[#EAE4D9] dark:border-[#3E3B35] text-center space-y-2.5">
                  <div className="text-[13px] font-medium text-[#22201D] dark:text-[#F5F2EC]">
                    {c.noSignalsInCol}
                  </div>
                  <button
                    type="button"
                    onClick={onSwitchToRadar}
                    className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[12px] font-semibold bg-[#1F6F43] dark:bg-[#81B64C] text-[#FFFFFF] dark:text-[#191815]"
                  >
                    {c.browseRadar}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectTrend(item.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectTrend(item.id);
                        }
                      }}
                      className="card-humanist p-4 rounded-[16px] bg-[#FFFFFF] dark:bg-[#2E2C28] hover:bg-[#FCFBF8] dark:hover:bg-[#383632] border border-[#EAE4D9] dark:border-[#3E3B35] shadow-card cursor-pointer space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <GradeBadge
                            score={item.emergenceScore}
                            maturity={item.maturity}
                          />
                          <CategoryTag category={item.category} lang={lang} />
                          <MarketBadge market={item.market} />
                        </div>
                        <span className="font-mono text-[14px] font-bold text-[#22201D] dark:text-[#F5F2EC] tabular-nums">
                          {item.emergenceScore}
                        </span>
                      </div>

                      <h3 className="font-display text-[13.5px] font-bold text-[#22201D] dark:text-[#F5F2EC] leading-[1.35]">
                        {item.title}
                      </h3>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <MaturityBadge
                          maturity={item.maturity}
                          daysSinceT0={item.daysSinceT0}
                          lang={lang}
                        />
                        <CertaintyBadge certainty={item.certainty} lang={lang} />
                      </div>

                      <div className="pt-2.5 border-t border-[#EFEAE0] dark:border-[#3E3B35] flex items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-2 text-[#625C53] dark:text-[#B5AFA4] truncate">
                          <span className="inline-flex items-center gap-0.5 font-mono font-medium text-[#22201D] dark:text-[#F5F2EC]">
                            <ArrowUp className="w-3 h-3" />
                            {item.votes.length}
                          </span>
                          <span>·</span>
                          <span className="truncate">
                            {item.recommendation.targetPole}
                          </span>
                        </div>

                        {col.nextStatus && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onChangeWatchlist(item.id, col.nextStatus!);
                            }}
                            className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FBF9F4] dark:bg-[#24221F] hover:bg-[#1F6F43] dark:hover:bg-[#81B64C] hover:text-[#FFFFFF] dark:hover:text-[#191815] text-[#22201D] dark:text-[#F5F2EC] border border-[#EAE4D9] dark:border-[#3E3B35] transition-colors shrink-0"
                          >
                            {translateWatchlist(col.nextStatus, lang)} →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Untracked Pool */}
      {untracked.length > 0 && (
        <div className="rounded-[20px] bg-[#FFFFFF] dark:bg-[#2E2C28] border border-[#EAE4D9] dark:border-[#3E3B35] p-5 space-y-3 shadow-card">
          <div className="text-[12.5px] font-semibold text-[#22201D] dark:text-[#F5F2EC]">
            {c.untrackedHeading} ({untracked.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {untracked.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTrend(t.id)}
                className="p-3 rounded-[14px] bg-[#FBF9F4] dark:bg-[#24221F] hover:bg-[#F4F0E8] dark:hover:bg-[#383632] border border-[#EAE4D9] dark:border-[#3E3B35] flex items-center justify-between gap-2 cursor-pointer transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-[12.5px] font-semibold text-[#22201D] dark:text-[#F5F2EC] truncate">
                    {t.title}
                  </div>
                  <div className="text-[11px] text-[#625C53] dark:text-[#B5AFA4] font-mono mt-0.5">
                    {t.market} · {t.emergenceScore} · {t.daysSinceT0}{lang === 'fr' ? 'j' : 'd'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeWatchlist(t.id, 'Monitoring');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FFFFFF] dark:bg-[#2E2C28] hover:bg-[#1F6F43] dark:hover:bg-[#81B64C] hover:text-[#FFFFFF] dark:hover:text-[#191815] text-[#22201D] dark:text-[#F5F2EC] border border-[#EAE4D9] dark:border-[#3E3B35] transition-colors shrink-0"
                >
                  <Plus className="w-3 h-3" />
                  <span>{c.trackBtn}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
