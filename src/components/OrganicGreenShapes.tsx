import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { AppLang } from '../types';
import { UI_COPY } from '../i18n';

interface HeroGreenWaveBackdropProps {
  compact?: boolean;
  tone?: 'emerald' | 'archive';
}

export const HeroGreenWaveBackdrop: React.FC<HeroGreenWaveBackdropProps> = ({
  compact = false,
  tone = 'emerald',
}) => {
  const isArchive = tone === 'archive';

  const colors = isArchive
    ? {
        layer1A: '#EEF4F0',
        layer1B: '#D9EAE0',
        layer2A: '#CCE3D5',
        layer2B: '#95C6A8',
        layer3A: '#8BC09F',
        layer3B: '#499367',
        layer4A: '#4E966C',
        layer4B: '#286E46',
      }
    : {
        layer1A: '#E6F5EB',
        layer1B: '#CFEBD8',
        layer2A: '#B9E4C8',
        layer2B: '#7FCF9C',
        layer3A: '#65BD84',
        layer3B: '#38995C',
        layer4A: '#3A9A5E',
        layer4B: '#267B47',
      };

  const gradPrefix = isArchive ? 'hero-arch' : 'hero-em';

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none absolute inset-y-0 right-0 overflow-hidden dark:opacity-45 ${
        compact ? 'w-[55%] max-w-[560px]' : 'w-[64%] max-w-[760px]'
      }`}
      style={{
        maskImage:
          'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.45) 26%, rgba(0,0,0,1) 58%)',
        WebkitMaskImage:
          'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.45) 26%, rgba(0,0,0,1) 58%)',
      }}
    >
      <svg
        viewBox="0 0 760 280"
        preserveAspectRatio="none"
        className="w-full h-full block"
      >
        <defs>
          <linearGradient id={`${gradPrefix}-1`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.layer1A} stopOpacity="0.65" />
            <stop offset="100%" stopColor={colors.layer1B} stopOpacity="0.82" />
          </linearGradient>
          <linearGradient id={`${gradPrefix}-2`} x1="15%" y1="0%" x2="95%" y2="100%">
            <stop offset="0%" stopColor={colors.layer2A} stopOpacity="0.58" />
            <stop offset="100%" stopColor={colors.layer2B} stopOpacity="0.78" />
          </linearGradient>
          <linearGradient id={`${gradPrefix}-3`} x1="20%" y1="10%" x2="100%" y2="95%">
            <stop offset="0%" stopColor={colors.layer3A} stopOpacity="0.46" />
            <stop offset="100%" stopColor={colors.layer3B} stopOpacity="0.62" />
          </linearGradient>
          <linearGradient id={`${gradPrefix}-4`} x1="30%" y1="20%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.layer4A} stopOpacity="0.28" />
            <stop offset="100%" stopColor={colors.layer4B} stopOpacity="0.44" />
          </linearGradient>
        </defs>

        <path
          d="M 80 280 C 190 210, 290 130, 430 148 C 565 165, 650 68, 760 26 L 760 280 Z"
          fill={`url(#${gradPrefix}-1)`}
        />
        <path
          d="M 190 280 C 300 225, 395 162, 518 172 C 625 182, 685 110, 760 76 L 760 280 Z"
          fill={`url(#${gradPrefix}-2)`}
        />
        <path
          d="M 300 280 C 405 236, 480 198, 595 200 C 675 202, 718 158, 760 132 L 760 280 Z"
          fill={`url(#${gradPrefix}-3)`}
        />
        <path
          d="M 445 280 C 530 250, 610 228, 690 232 C 724 234, 744 214, 760 198 L 760 280 Z"
          fill={`url(#${gradPrefix}-4)`}
        />
        <path
          d="M 190 280 C 300 225, 395 162, 518 172 C 625 182, 685 110, 760 76"
          fill="none"
          stroke={colors.layer3B}
          strokeOpacity="0.24"
          strokeWidth="1.25"
        />
      </svg>
    </div>
  );
};

export const RadarEmblemIcon: React.FC<{ mode?: 'radar' | 'past' }> = ({
  mode = 'radar',
}) => {
  const isPast = mode === 'past';
  const strokeMain = isPast ? '#B45353' : '#2E8B57';
  const ringBg = isPast
    ? 'bg-[#FAF0F0] border-[#E8D2D2] dark:bg-[#3A2828] dark:border-[#5D3C3C]'
    : 'bg-[#E7F5EC] border-[#CDE9D6] dark:bg-[#263628] dark:border-[#395439]';

  return (
    <div
      className={`w-11 h-11 rounded-full border flex items-center justify-center shrink-0 shadow-xs ${ringBg}`}
      aria-hidden="true"
    >
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle
          cx="13"
          cy="13"
          r="10.25"
          stroke={strokeMain}
          strokeOpacity="0.32"
          strokeWidth="1.25"
        />
        <circle
          cx="13"
          cy="13"
          r="6.25"
          stroke={strokeMain}
          strokeOpacity="0.5"
          strokeWidth="1.25"
        />
        {isPast ? (
          <>
            <path
              d="M13 7.5V13L16.5 15.2"
              stroke={strokeMain}
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="13" cy="13" r="1.8" fill={strokeMain} />
          </>
        ) : (
          <>
            <path
              d="M13 13 L20.2 6.8"
              stroke={strokeMain}
              strokeWidth="1.65"
              strokeLinecap="round"
            />
            <path
              d="M13 3 A10 10 0 0 1 22.3 9.4 L13 13 Z"
              fill={strokeMain}
              fillOpacity="0.2"
            />
            <circle cx="18.2" cy="8.4" r="1.8" fill={strokeMain} />
            <circle cx="13" cy="13" r="2.1" fill={strokeMain} />
          </>
        )}
      </svg>
    </div>
  );
};

interface SidebarGreenPromoCardProps {
  onClick: () => void;
  lang: AppLang;
}

export const SidebarGreenPromoCard: React.FC<SidebarGreenPromoCardProps> = ({
  onClick,
  lang,
}) => {
  const c = UI_COPY[lang];
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-[18px] bg-gradient-to-b from-[#EFF8F2] to-[#E0F2E6] dark:from-[#263527] dark:to-[#1F2D21] border border-[#CAE5D3] dark:border-[#395439] hover:border-[#9FD6B2] dark:hover:border-[#568958] overflow-hidden relative p-4 min-h-[148px] flex flex-col justify-between group transition-colors duration-150 shadow-xs"
    >
      <div className="relative z-10 space-y-1">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FFFFFF]/85 dark:bg-[#19231B]/90 border border-[#CAE5D3] dark:border-[#3E5C3E] font-mono text-[9.5px] font-semibold tracking-[0.04em] text-[#1F6F43] dark:text-[#81B64C]">
          {c.promoBadge}
        </span>
        <div className="font-display text-[13.5px] font-bold text-[#153622] dark:text-[#EDF7EC] leading-[1.25] pt-0.5">
          {c.promoTitle}
        </div>
        <p className="text-[11.5px] text-[#2F5B40] dark:text-[#B5D6B7] leading-[1.35]">
          {c.promoSub}
        </p>
        <span className="inline-flex items-center gap-1 pt-1 text-[11px] font-semibold text-[#1B6E3E] dark:text-[#81B64C] group-hover:translate-x-0.5 transition-transform">
          <span>{c.promoCta}</span>
          <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>

      <svg
        aria-hidden="true"
        viewBox="0 0 210 56"
        preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-0 inset-x-0 w-full h-[52px] dark:opacity-75"
      >
        <path
          d="M0 34 C 36 16, 78 44, 126 26 C 162 12, 186 24, 210 14 L 210 56 L 0 56 Z"
          fill="#A7DDB9"
          fillOpacity="0.68"
        />
        <path
          d="M0 42 C 48 26, 92 48, 144 33 C 174 24, 194 34, 210 26 L 210 56 L 0 56 Z"
          fill="#56B277"
          fillOpacity="0.62"
        />
        <path
          d="M0 49 C 56 38, 108 52, 162 41 C 184 36, 198 42, 210 38 L 210 56 L 0 56 Z"
          fill="#217342"
          fillOpacity="0.58"
        />
      </svg>
    </button>
  );
};
