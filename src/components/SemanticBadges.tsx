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
  'bg-[#E4F2E8] text-[#1F6F43] border-[#CAE5D3] dark:bg-[#263628] dark:text-[#81B64C] dark:border-[#395439]',
  'bg-[#F9ECE4] text-[#9A421E] border-[#EECFC0] dark:bg-[#3A2820] dark:text-[#F4A688] dark:border-[#5D3F32]',
  'bg-[#FAF2DE] text-[#8F5B09] border-[#ECDAA8] dark:bg-[#3A2F1C] dark:text-[#FBBF24] dark:border-[#594829]',
  'bg-[#ECEFF9] text-[#4556A1] border-[#D3DAF1] dark:bg-[#272D3F] dark:text-[#A3B6FA] dark:border-[#3B445E]',
  'bg-[#F7EAEF] text-[#8E3556] border-[#EAD0DA] dark:bg-[#3A262E] dark:text-[#F4A2C0] dark:border-[#5B3B47]',
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
      ? 'w-7 h-7 text-[10.5px]'
      : 'w-6 h-6 text-[9.5px]';

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
        className="w-8 h-8 rounded-[10px] inline-flex items-center justify-center font-display text-[13px] font-bold bg-[#F6F0F0] text-[#8E3535] border border-[#E7D3D3] dark:bg-[#3A2727] dark:text-[#F29C9C] dark:border-[#5D3838]"
      >
        P
      </span>
    );
  }

  if (grade === 'A') {
    return (
      <span
        title="Grade A"
        className="w-8 h-8 rounded-[10px] inline-flex items-center justify-center font-display text-[14px] font-bold bg-[#EBF5EE] text-[#1F6F43] border border-[#CAE5D3] dark:bg-[#263628] dark:text-[#81B64C] dark:border-[#395439]"
      >
        A
      </span>
    );
  }

  if (grade === 'B') {
    return (
      <span
        title="Grade B"
        className="w-8 h-8 rounded-[10px] inline-flex items-center justify-center font-display text-[14px] font-bold bg-[#FAF0DE] text-[#B45309] border border-[#F0DFC2] dark:bg-[#3C2F1E] dark:text-[#FBBF24] dark:border-[#5C4629]"
      >
        B
      </span>
    );
  }

  return (
    <span
      title="Grade C"
      className="w-8 h-8 rounded-[10px] inline-flex items-center justify-center font-display text-[14px] font-bold bg-[#FDEEEE] text-[#B42318] border border-[#F6CDCB] dark:bg-[#3A2525] dark:text-[#F87171] dark:border-[#5E3535]"
    >
      C
    </span>
  );
};

export const MarketBadge: React.FC<{ market: TrendMarket }> = ({ market }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-[#EEF2F7] text-[#334155] border border-[#D7E0EC] dark:bg-[#272D36] dark:text-[#CBD5E1] dark:border-[#3D4654] whitespace-nowrap">
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
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#EBF5EE] text-[#1F6F43] border border-[#CAE5D3] dark:bg-[#263628] dark:text-[#81B64C] dark:border-[#395439] whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1F6F43] dark:bg-[#81B64C]" />
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
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#FAF4EA] text-[#B45309] border border-[#F0DFC2] dark:bg-[#3C2F1E] dark:text-[#FBBF24] dark:border-[#5C4629] whitespace-nowrap">
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
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#F8EFEF] text-[#8E3535] border border-[#EAD4D4] dark:bg-[#3A2727] dark:text-[#F29C9C] dark:border-[#5D3838] whitespace-nowrap max-w-full"
    >
      <History className="w-3 h-3 shrink-0" strokeWidth={2} />
      <span>{label}</span>
      {!compact && eraLabel && (
        <span className="font-mono text-[10px] opacity-80 truncate max-w-[84px]">
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
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#EBF5EE] text-[#1F6F43] border border-[#CAE5D3] dark:bg-[#263628] dark:text-[#81B64C] dark:border-[#395439] whitespace-nowrap">
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
        <span>{label}</span>
      </span>
    );
  }

  if (certainty === 'To Confirm') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#FAF4EA] text-[#B45309] border border-[#F0DFC2] dark:bg-[#3C2F1E] dark:text-[#FBBF24] dark:border-[#5C4629] whitespace-nowrap">
        <HelpCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
        <span>{label}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#FDEEEE] text-[#B42318] border border-[#F6CDCB] dark:bg-[#3A2525] dark:text-[#F87171] dark:border-[#5E3535] whitespace-nowrap">
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
      ? '#C85249'
      : maturity === 'Early Spark'
      ? '#D9822B'
      : '#4D9F58';

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
          className="flex-1 h-[3.5px] rounded-full bg-[#ECECE8] dark:bg-[#43403A] overflow-hidden"
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
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F4F0E8] text-[#4F4A42] border border-[#EAE4D9] dark:bg-[#272522] dark:text-[#D5D1C8] dark:border-[#3E3B35] whitespace-nowrap">
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
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#FFFFFF] text-[#3B3E44] border border-[#EAE4D9] dark:bg-[#272522] dark:text-[#D5D1C8] dark:border-[#3E3B35] whitespace-nowrap"
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
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EBF5EE] text-[#1F6F43] border border-[#CAE5D3] dark:bg-[#263628] dark:text-[#81B64C] dark:border-[#395439] whitespace-nowrap">
        <Send className="w-2.5 h-2.5" />
        <span>{label}</span>
      </span>
    );
  }

  if (status === 'Under Review') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FAF4EA] text-[#B45309] border border-[#F0DFC2] dark:bg-[#3C2F1E] dark:text-[#FBBF24] dark:border-[#5C4629] whitespace-nowrap">
        <Clock className="w-2.5 h-2.5" />
        <span>{label}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F1F3FA] text-[#4B5CA8] border border-[#DCE1F4] dark:bg-[#262B3A] dark:text-[#93A8F5] dark:border-[#3B4259] whitespace-nowrap">
      <Bookmark className="w-2.5 h-2.5" />
      <span>{label}</span>
    </span>
  );
};
