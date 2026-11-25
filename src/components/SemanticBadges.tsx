import React from 'react';
import {
  AppLang,
  CertaintyLevel,
  MaturityStage,
  MediawanCategory,
  PlatformSource,
  ScoreBreakdown,
  TrendMarket,
  WatchlistStatus,
} from '../types';
import {
  AlertTriangle,
  Bookmark,
  Clock,
  Flame,
  HelpCircle,
  History,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { PlatformBrandIcon } from './PlatformIcons';
import {
  translateCertainty,
  translateMaturity,
  translateMediawanCategory,
  translateWatchlist,
} from '../i18n';

/** Shared by category tags and radar dots. */
export const CATEGORY_COLORS: Record<MediawanCategory, string> = {
  Fiction: '#B7A6FF',
  Animation: '#C4B897',
  Documentary: '#FFC2B4',
  Entertainment: '#FFFFFF',
  Talents: '#FF6445',
};

export function getSignalGrade(
  score: number,
  maturity: MaturityStage
): 'A' | 'B' | 'C' | 'P' {
  if (maturity === 'Past Era') return 'P';
  if (score >= 88 && maturity === 'Breakout Zone') return 'A';
  if (maturity === 'Early Spark' || score < 75) return 'C';
  return 'B';
}

const AVATAR_TONES = [
  'bg-accent-soft text-accent border-accent-line',
  'bg-canvas text-danger border-danger-line',
  'bg-warn-soft text-warn border-warn',
  'bg-canvas text-info border-info-line',
  'bg-danger-soft text-danger border-danger-line',
];

export const ColleagueAvatar: React.FC<{
  initials: string;
  title?: string;
  size?: 'xs' | 'sm' | 'md';
}> = ({ initials, title, size = 'sm' }) => {
  const code =
    (initials.charCodeAt(0) || 65) + (initials.charCodeAt(1) || 65);
  const tone = AVATAR_TONES[code % AVATAR_TONES.length];
  const dims =
    size === 'xs'
      ? 'w-5 h-5 text-[8.5px]'
      : size === 'md'
      ? 'w-7 h-7 text-[11px]'
      : 'w-6 h-6 text-[11px]';

  return (
    <span
      title={title}
      className={`${dims} rounded-full border font-display font-bold inline-flex items-center justify-center shrink-0 ${tone}`}
    >
      {initials}
    </span>
  );
};

export const GradeBadge: React.FC<{
  score: number;
  maturity: MaturityStage;
}> = ({ score, maturity }) => {
  const grade = getSignalGrade(score, maturity);

  if (grade === 'P') {
    return (
      <span
        title="Past Era (P)"
        className="w-8 h-8 rounded-[10px] inline-flex items-center justify-center font-display text-[13px] font-bold bg-danger-soft text-danger border border-danger-line"
      >
        P
      </span>
    );
  }

  if (grade === 'A') {
    return (
      <span
        title="Grade A"
        className="w-8 h-8 rounded-[10px] inline-flex items-center justify-center font-display text-[14px] font-bold bg-accent-soft text-accent border border-accent-line"
      >
        A
      </span>
    );
  }

  if (grade === 'B') {
    return (
      <span
        title="Grade B"
        className="w-8 h-8 rounded-[10px] inline-flex items-center justify-center font-display text-[14px] font-bold bg-warn-soft text-warn border border-warn-line"
      >
        B
      </span>
    );
  }

  return (
    <span
      title="Grade C"
      className="w-8 h-8 rounded-[10px] inline-flex items-center justify-center font-display text-[14px] font-bold bg-danger-soft text-danger border border-danger-line"
    >
      C
    </span>
  );
};

export const MarketBadge: React.FC<{ market: TrendMarket }> = ({ market }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold bg-canvas text-info border border-info-line whitespace-nowrap">
      {market}
    </span>
  );
};

export const MaturityBadge: React.FC<{
  maturity: MaturityStage;
  daysSinceT0?: number;
  eraLabel?: string;
  compact?: boolean;
  lang?: AppLang;
}> = ({ maturity, daysSinceT0, eraLabel, compact, lang = 'en' }) => {
  const label = translateMaturity(maturity, lang);
  const unit = lang === 'fr' ? 'j' : 'd';

  if (maturity === 'Breakout Zone') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-accent-soft text-accent border border-accent-line whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-pop" />
        <span>{label}</span>
        {!compact && daysSinceT0 !== undefined && (
          <span className="font-mono text-[11px] opacity-85">
            · {daysSinceT0}
            {unit}
          </span>
        )}
      </span>
    );
  }

  if (maturity === 'Early Spark') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-warn-soft text-warn border border-warn-line whitespace-nowrap">
        <Flame className="w-3 h-3 shrink-0" strokeWidth={2} />
        <span>{label}</span>
        {!compact && daysSinceT0 !== undefined && (
          <span className="font-mono text-[11px] opacity-85">
            · {daysSinceT0}
            {unit}
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      title={eraLabel}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-danger-soft text-danger border border-danger-line whitespace-nowrap max-w-full"
    >
      <History className="w-3 h-3 shrink-0" strokeWidth={2} />
      <span>{label}</span>
      {!compact && eraLabel && (
        <span className="font-mono text-[11px] opacity-80 truncate max-w-[84px]">
          · {eraLabel}
        </span>
      )}
    </span>
  );
};

export const CertaintyBadge: React.FC<{
  certainty: CertaintyLevel;
  lang?: AppLang;
}> = ({ certainty, lang = 'en' }) => {
  const label = translateCertainty(certainty, lang);

  if (certainty === 'High Confidence') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-accent-soft text-accent border border-accent-line whitespace-nowrap">
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
        <span>{label}</span>
      </span>
    );
  }

  if (certainty === 'To Confirm') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-warn-soft text-warn border border-warn-line whitespace-nowrap">
        <HelpCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
        <span>{label}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-danger-soft text-danger border border-danger-line whitespace-nowrap">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
      <span>{label}</span>
    </span>
  );
};

export const PillarMiniMeter: React.FC<{
  breakdown: ScoreBreakdown;
  maturity: MaturityStage;
}> = ({ breakdown, maturity }) => {
  const barColor =
    maturity === 'Past Era'
      ? 'var(--mw-danger)'
      : maturity === 'Early Spark'
      ? '#FF6445'
      : '#8F78F5';

  const pillars = [
    { label: 'Remix', ratio: breakdown.remixVelocity / 30 },
    { label: 'Cross', ratio: breakdown.crossPlatformJump / 25 },
    { label: 'Intent', ratio: breakdown.audienceIntent / 25 },
    { label: 'Lift', ratio: breakdown.smallAccountLift / 20 },
  ];

  return (
    <div className="flex items-center gap-1 w-[112px]" aria-hidden="true">
      {pillars.map((p) => (
        <div
          key={p.label}
          className="flex-1 h-[3.5px] rounded-full bg-canvas overflow-hidden"
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.max(12, Math.min(100, Math.round(p.ratio * 100)))}%`,
              backgroundColor: barColor,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export const CategoryTag: React.FC<{
  category: MediawanCategory;
  lang?: AppLang;
}> = ({ category, lang = 'en' }) => {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-[#1D1D1F] border-[1.5px] border-[#1D1D1F] whitespace-nowrap"
      style={{ backgroundColor: CATEGORY_COLORS[category] }}
    >
      {translateMediawanCategory(category, lang)}
    </span>
  );
};

const PLATFORM_ABBR: Record<PlatformSource, string> = {
  TikTok: 'TT',
  YouTube: 'YT',
  Instagram: 'IG',
  Facebook: 'FB',
  Reddit: 'RD',
  'Google Trends': 'GT',
  'Wattpad/Webtoon': 'WP',
  'Roblox/Twitch': 'RBX',
};

export const PlatformMiniBadge: React.FC<{
  platform: PlatformSource;
  showFull?: boolean;
}> = ({ platform, showFull }) => {
  return (
    <span
      title={platform}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-surface text-ink-2 border border-line whitespace-nowrap"
    >
      <PlatformBrandIcon platform={platform} size={12} />
      <span>{showFull ? platform : PLATFORM_ABBR[platform]}</span>
    </span>
  );
};

export const WatchlistPill: React.FC<{
  status: WatchlistStatus;
  lang?: AppLang;
}> = ({ status, lang = 'en' }) => {
  if (status === 'Not Tracked') return null;
  const label = translateWatchlist(status, lang);

  if (status === 'Outreach Started') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-accent-soft text-accent border border-accent-line whitespace-nowrap">
        <Send className="w-2.5 h-2.5" />
        <span>{label}</span>
      </span>
    );
  }

  if (status === 'Under Review') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-warn-soft text-warn border border-warn-line whitespace-nowrap">
        <Clock className="w-2.5 h-2.5" />
        <span>{label}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-soft text-info border border-info-line whitespace-nowrap">
      <Bookmark className="w-2.5 h-2.5" />
      <span>{label}</span>
    </span>
  );
};
