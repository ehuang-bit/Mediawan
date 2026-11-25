import React, { useEffect, useState } from 'react';
import { MicroTrend } from '../types';

interface TrendThumbnailProps {
  trend: MicroTrend;
  variant?: 'row' | 'hero';
}

export const TrendThumbnail: React.FC<TrendThumbnailProps> = ({
  trend,
  variant = 'row',
}) => {
  const isHero = variant === 'hero';
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [trend.viralVideo.thumbnailUrl]);

  const hasLiveImage = Boolean(trend.viralVideo.thumbnailUrl && !imgFailed);

  const renderArtwork = () => {
    switch (trend.id) {
      case 'mw-sig-01':
        // Knights of Guinevere — 2D sci-fi cloud theme park castle
        return (
          <svg viewBox="0 0 120 84" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="g01" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1E1B4B" />
                <stop offset="100%" stopColor="#3B3086" />
              </linearGradient>
            </defs>
            <rect width="120" height="84" fill="url(#g01)" />
            <circle cx="94" cy="20" r="10" fill="#A5F3FC" fillOpacity="0.28" />
            <path d="M0 68Q25 56 50 66T100 62L120 66V84H0Z" fill="#E0E7FF" fillOpacity="0.2" />
            <rect x="44" y="28" width="32" height="44" fill="#312E81" stroke="#A5F3FC" strokeWidth="1.2" />
            <polygon points="40,28 60,12 80,28" fill="#6366F1" />
            <rect x="55" y="48" width="10" height="24" rx="5" fill="#A5F3FC" fillOpacity="0.85" />
          </svg>
        );

      case 'mw-sig-02':
        // Curry Barker — Found-footage VHS horror frame
        return (
          <svg viewBox="0 0 120 84" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <rect width="120" height="84" fill="#18181B" />
            <rect x="10" y="10" width="100" height="64" rx="2" fill="none" stroke="#52525B" strokeWidth="1.2" />
            <circle cx="20" cy="20" r="3.5" fill="#EF4444" />
            <line x1="28" y1="20" x2="46" y2="20" stroke="#E4E4E7" strokeWidth="2" />
            <circle cx="60" cy="44" r="14" fill="#27272A" stroke="#F59E0B" strokeWidth="1.5" />
            <circle cx="60" cy="44" r="5" fill="#F59E0B" />
            <line x1="14" y1="62" x2="106" y2="62" stroke="#3F3F46" strokeWidth="1" strokeDasharray="3 3" />
          </svg>
        );

      case 'mw-sig-03':
        // GOBELINS Paris — French geometric 2D animation film frame
        return (
          <svg viewBox="0 0 120 84" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <rect width="120" height="84" fill="#18222F" />
            <circle cx="38" cy="42" r="22" fill="#F97316" fillOpacity="0.88" />
            <polygon points="56,18 96,64 46,64" fill="#38BDF8" fillOpacity="0.85" />
            <rect x="20" y="14" width="80" height="56" rx="3" fill="none" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="1.2" />
            <circle cx="84" cy="28" r="6" fill="#FACC15" />
          </svg>
        );

      case 'mw-sig-04':
        // Royal Road -> Webtoon LitRPG book & digital panels
        return (
          <svg viewBox="0 0 120 84" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <rect width="120" height="84" fill="#F2ECE1" />
            <rect x="18" y="14" width="38" height="56" rx="3" fill="#1E293B" />
            <line x1="26" y1="28" x2="48" y2="28" stroke="#F59E0B" strokeWidth="2.5" />
            <line x1="26" y1="38" x2="44" y2="38" stroke="#94A3B8" strokeWidth="2" />
            <rect x="64" y="14" width="38" height="26" rx="3" fill="#16A34A" fillOpacity="0.85" />
            <rect x="64" y="44" width="38" height="26" rx="3" fill="#F97316" fillOpacity="0.85" />
          </svg>
        );

      case 'mw-sig-05':
        // fern — 3D investigative radar & dark crime map
        return (
          <svg viewBox="0 0 120 84" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <rect width="120" height="84" fill="#0F2233" />
            <circle cx="60" cy="42" r="32" fill="none" stroke="#1E4B6E" strokeWidth="1" />
            <circle cx="60" cy="42" r="18" fill="none" stroke="#1E4B6E" strokeWidth="1" />
            <line x1="60" y1="6" x2="60" y2="78" stroke="#1E4B6E" strokeWidth="0.8" />
            <line x1="16" y1="42" x2="104" y2="42" stroke="#1E4B6E" strokeWidth="0.8" />
            <path d="M60 42L88 22A32 32 0 0 1 92 42Z" fill="#16A34A" fillOpacity="0.3" />
            <circle cx="77" cy="29" r="3.5" fill="#EF4444" />
            <circle cx="44" cy="54" r="2.5" fill="#38BDF8" />
          </svg>
        );

      case 'mw-sig-06':
        // TheGreatReview & EGO — French cinema essay timeline
        return (
          <svg viewBox="0 0 120 84" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <rect width="120" height="84" fill="#18181B" />
            <rect x="16" y="18" width="88" height="36" rx="4" fill="#27272A" stroke="#3F3F46" strokeWidth="1.2" />
            <polygon points="54,28 54,44 69,36" fill="#F4F4F5" />
            <line x1="16" y1="66" x2="104" y2="66" stroke="#3F3F46" strokeWidth="3" strokeLinecap="round" />
            <line x1="16" y1="66" x2="72" y2="66" stroke="#D94E2A" strokeWidth="3" strokeLinecap="round" />
            <circle cx="72" cy="66" r="4" fill="#FFFFFF" />
          </svg>
        );

      case 'mw-sig-07':
        // Jet Lag: The Game — European rail strategy route
        return (
          <svg viewBox="0 0 120 84" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <rect width="120" height="84" fill="#EFF6FF" />
            <path d="M14 62L38 30L66 52L104 20" stroke="#1E3A8A" strokeWidth="2.5" fill="none" strokeDasharray="4 3" />
            <circle cx="14" cy="62" r="5" fill="#15803D" />
            <circle cx="38" cy="30" r="5" fill="#F59E0B" />
            <circle cx="66" cy="52" r="5" fill="#1E3A8A" />
            <circle cx="104" cy="20" r="6" fill="#DC2626" />
          </svg>
        );

      case 'mw-sig-08':
        // Dropout / Game Changer — studio game podiums
        return (
          <svg viewBox="0 0 120 84" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <rect width="120" height="84" fill="#2E1065" />
            <circle cx="60" cy="18" r="7" fill="#F59E0B" />
            <rect x="18" y="42" width="22" height="32" rx="3" fill="#F59E0B" />
            <rect x="49" y="38" width="22" height="36" rx="3" fill="#EC4899" />
            <rect x="80" y="42" width="22" height="32" rx="3" fill="#38BDF8" />
          </svg>
        );

      case 'mw-sig-09':
        // BookTok Cozy Fantasy — warm lantern & open book
        return (
          <svg viewBox="0 0 120 84" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <rect width="120" height="84" fill="#FDF4E8" />
            <path d="M22 60V24C36 20 52 24 60 30C68 24 84 20 98 24V60C84 56 68 60 60 66C52 60 36 56 22 60Z" fill="#FFFFFF" stroke="#D97706" strokeWidth="1.8" />
            <line x1="60" y1="30" x2="60" y2="66" stroke="#D97706" strokeWidth="1.4" />
            <circle cx="88" cy="20" r="8" fill="#15803D" fillOpacity="0.22" />
            <circle cx="88" cy="20" r="3.5" fill="#15803D" />
          </svg>
        );

      case 'mw-sig-10':
        // Djilsi — French creator ensemble silence/buzzer studio
        return (
          <svg viewBox="0 0 120 84" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <rect width="120" height="84" fill="#18191F" />
            <rect x="18" y="16" width="84" height="52" rx="6" fill="#232630" stroke="#3F4454" strokeWidth="1.2" />
            <circle cx="42" cy="42" r="11" fill="#16A34A" />
            <circle cx="78" cy="42" r="11" fill="#EF4444" />
            <rect x="52" y="24" width="16" height="4" rx="2" fill="#FACC15" />
          </svg>
        );

      case 'mw-sig-11':
        // Roblox Forsaken — blocky asymmetrical horror arena
        return (
          <svg viewBox="0 0 120 84" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <rect width="120" height="84" fill="#1E1B4B" />
            <rect x="18" y="48" width="22" height="22" rx="3" fill="#6366F1" />
            <rect x="49" y="28" width="22" height="22" rx="3" fill="#F59E0B" />
            <rect x="80" y="44" width="22" height="22" rx="3" fill="#EF4444" />
          </svg>
        );

      case 'mw-past-01':
        // Skibidi Toilet Era — retro CRT TV-head & camera silhouette
        return (
          <svg viewBox="0 0 120 84" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <rect width="120" height="84" fill="#141820" />
            <rect x="28" y="20" width="64" height="42" rx="5" fill="#272D3B" stroke="#94A3B8" strokeWidth="1.6" />
            <rect x="34" y="26" width="52" height="30" rx="2" fill="#0F172A" />
            <path d="M40 41H52L56 33L63 49L68 38L73 41H80" stroke="#38BDF8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="48" y1="12" x2="58" y2="20" stroke="#94A3B8" strokeWidth="1.5" />
            <line x1="72" y1="12" x2="62" y2="20" stroke="#94A3B8" strokeWidth="1.5" />
            <rect x="44" y="64" width="32" height="8" rx="2" fill="#475569" />
          </svg>
        );

      case 'mw-past-02':
        // HUSS HUSS HUSS — Roblox basketball + kinetic funk beat bars
        return (
          <svg viewBox="0 0 120 84" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <rect width="120" height="84" fill="#1D1A18" />
            <circle cx="38" cy="42" r="18" fill="#EA580C" stroke="#FED7AA" strokeWidth="1.5" />
            <path d="M20 42H56M38 24V60" stroke="#7C2D12" strokeWidth="1.4" />
            <rect x="68" y="28" width="6" height="28" rx="3" fill="#22C55E" />
            <rect x="79" y="18" width="6" height="48" rx="3" fill="#F59E0B" />
            <rect x="90" y="24" width="6" height="36" rx="3" fill="#EF4444" />
            <rect x="101" y="32" width="6" height="20" rx="3" fill="#F59E0B" />
          </svg>
        );

      case 'mw-past-03':
        // Quoicoubeh / Apagnan — French schoolyard TikTok speech-bubble trap
        return (
          <svg viewBox="0 0 120 84" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <rect width="40" height="84" fill="#1D4ED8" />
            <rect x="40" width="40" height="84" fill="#F8FAFC" />
            <rect x="80" width="40" height="84" fill="#DC2626" />
            <rect width="120" height="84" fill="#111827" fillOpacity="0.34" />
            <rect x="26" y="22" width="68" height="34" rx="8" fill="#FFFFFF" />
            <polygon points="44,56 54,56 42,67" fill="#FFFFFF" />
            <line x1="38" y1="35" x2="82" y2="35" stroke="#16181A" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="38" y1="45" x2="66" y2="45" stroke="#DC2626" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        );

      case 'mw-past-04':
        // Grimace Shake Horror Parody — purple cup + crime-scene stripe
        return (
          <svg viewBox="0 0 120 84" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <rect width="120" height="84" fill="#221236" />
            <path d="M44 26H76L71 68H49Z" fill="#9333EA" stroke="#E9D5FF" strokeWidth="1.5" />
            <ellipse cx="60" cy="26" rx="17" ry="5" fill="#F3E8FF" />
            <line x1="60" y1="12" x2="66" y2="26" stroke="#FACC15" strokeWidth="3" strokeLinecap="round" />
            <line x1="0" y1="68" x2="120" y2="56" stroke="#FACC15" strokeWidth="6" strokeDasharray="10 6" strokeOpacity="0.85" />
          </svg>
        );

      case 'mw-past-05':
        // Chill Guy — warm olive/beige calm horizon + sweater silhouette
        return (
          <svg viewBox="0 0 120 84" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <rect width="120" height="84" fill="#EAE6DF" />
            <circle cx="60" cy="33" r="14" fill="#A16207" fillOpacity="0.85" />
            <path d="M32 80C32 58 46 48 60 48C74 48 88 58 88 80Z" fill="#6B7280" />
            <ellipse cx="66" cy="34" rx="5" ry="2.2" fill="#1F2937" />
            <circle cx="24" cy="22" r="7" fill="#1B6E3E" fillOpacity="0.2" />
          </svg>
        );

      case 'mw-past-06':
        // The Rizzler / Rizz Era — stream spotlight & hype counter
        return (
          <svg viewBox="0 0 120 84" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <rect width="120" height="84" fill="#1E1B4B" />
            <circle cx="60" cy="40" r="24" fill="none" stroke="#F43F5E" strokeWidth="3" />
            <circle cx="60" cy="40" r="14" fill="#312E81" />
            <rect x="42" y="64" width="36" height="8" rx="4" fill="#F43F5E" />
            <circle cx="88" cy="20" r="4" fill="#22C55E" />
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 120 84" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <rect width="120" height="84" fill="#E8F7EE" />
            <circle cx="60" cy="42" r="22" fill="#15803D" fillOpacity="0.16" />
            <circle cx="60" cy="42" r="11" fill="#15803D" fillOpacity="0.32" />
            <circle cx="60" cy="42" r="4" fill="#15803D" />
          </svg>
        );
    }
  };

  if (isHero) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        {hasLiveImage ? (
          <img
            src={trend.viralVideo.thumbnailUrl}
            alt={trend.title}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          renderArtwork()
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141619]/85 via-[#141619]/25 to-transparent" />
      </div>
    );
  }

  return (
    <div className="w-[112px] h-[66px] rounded-[11px] overflow-hidden border border-line shrink-0 bg-canvas shadow-xs">
      {hasLiveImage ? (
        <img
          src={trend.viralVideo.thumbnailUrl}
          alt={trend.title}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        renderArtwork()
      )}
    </div>
  );
};
