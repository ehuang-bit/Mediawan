import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowUp,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Copy,
  Download,
  FileText,
  Hash,
  History,
  MinusCircle,
  Play,
  ShieldAlert,
  UserCheck,
  X,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AppLang, MicroTrend, TeamVote, WatchlistStatus } from '../types';
import {
  CategoryTag,
  CertaintyBadge,
  ColleagueAvatar,
  MarketBadge,
  MaturityBadge,
  PlatformMiniBadge,
} from './SemanticBadges';
import { TrendThumbnail } from './TrendThumbnail';
import {
  downloadTextFile,
  generateOnePagerMarkdown,
} from '../utils/exportMarkdown';
import { translateWatchlist, UI_COPY } from '../i18n';

interface GreenlightDrawerProps {
  trend: MicroTrend | null;
  rankNumber?: number;
  focusVoteTrigger?: number;
  canNavigatePrev?: boolean;
  canNavigateNext?: boolean;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  onClose: () => void;
  onChangeWatchlist: (trendId: string, status: WatchlistStatus) => void;
  onCastVote: (trendId: string, vote: Omit<TeamVote, 'id' | 'timestamp'>) => void;
  onClickHashtag: (hashtag: string) => void;
  onShowToast: (msg: string) => void;
  lang: AppLang;
}

const WATCHLIST_OPTIONS: WatchlistStatus[] = [
  'Not Tracked',
  'Monitoring',
  'Under Review',
  'Outreach Started',
];

const COLLEAGUE_PRESETS = [
  { name: 'Sophie Marceau-L.', pole: 'Animation · Kids & Family' },
  { name: 'Lucas Delacroix', pole: 'Fiction · Storia TV' },
  { name: 'Claire Rochefort', pole: 'Acquisitions · Group' },
];

const MEDIAWAN_POLES = [
  'Fiction · Storia TV',
  'Fiction · Chapter 2',
  'Animation · Kids & Family',
  'Acquisitions · Group',
  'Documentary · Paris',
  'Talent Lab · Paris',
  'Palomar · Italy',
  'Leonine · Germany',
  'Mediawan Prod · Unscripted',
];

function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'MW';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const GreenlightDrawer: React.FC<GreenlightDrawerProps> = ({
  trend,
  rankNumber,
  focusVoteTrigger,
  canNavigatePrev,
  canNavigateNext,
  onNavigatePrev,
  onNavigateNext,
  onClose,
  onChangeWatchlist,
  onCastVote,
  onClickHashtag,
  onShowToast,
  lang,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);

  const [voterName, setVoterName] = useState('Claire Rochefort');
  const [voterPole, setVoterPole] = useState('Acquisitions · Group');
  const [voteRationale, setVoteRationale] = useState('');
  const [voteError, setVoteError] = useState<string | null>(null);
  const [justVoted, setJustVoted] = useState(false);

  const voteFormRef = useRef<HTMLFormElement>(null);
  const rationaleInputRef = useRef<HTMLTextAreaElement>(null);

  const c = UI_COPY[lang];

  useEffect(() => {
    setPreviewExpanded(false);
    setVoteError(null);
    setJustVoted(false);
  }, [trend?.id]);

  useEffect(() => {
    if (focusVoteTrigger && trend) {
      const timer = setTimeout(() => {
        voteFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        rationaleInputRef.current?.focus();
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [focusVoteTrigger, trend]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!trend) return;
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === 'ArrowLeft' && canNavigatePrev && onNavigatePrev) {
        e.preventDefault();
        onNavigatePrev();
      } else if (e.key === 'ArrowRight' && canNavigateNext && onNavigateNext) {
        e.preventDefault();
        onNavigateNext();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [trend, onClose, canNavigatePrev, canNavigateNext, onNavigatePrev, onNavigateNext]);

  if (!trend) return null;

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('signal', trend.id);
    navigator.clipboard?.writeText(url.toString()).catch(() => {});
    window.history.replaceState({}, '', url.toString());
    setCopiedLink(true);
    onShowToast(c.copied);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportMarkdown = () => {
    const md = generateOnePagerMarkdown(trend, rankNumber);
    const slug = trend.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 48);
    downloadTextFile(`mediawan-onepager-${slug}.md`, md);
    onShowToast(`${c.exportOnePager}`);
  };

  const handleVoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterName.trim()) {
      setVoteError(lang === 'fr' ? 'Entrez votre nom.' : 'Enter your name.');
      return;
    }
    if (voteRationale.trim().length < 6) {
      setVoteError(
        lang === 'fr'
          ? 'Ajoutez une courte justification.'
          : 'Write a short editorial note.'
      );
      return;
    }

    onCastVote(trend.id, {
      colleagueName: voterName.trim(),
      initials: computeInitials(voterName),
      pole: voterPole,
      rationale: voteRationale.trim(),
    });
    setVoteRationale('');
    setVoteError(null);
    setJustVoted(true);
    onShowToast(`${voterName.trim()} · +1`);
    setTimeout(() => setJustVoted(false), 1800);
  };

  const uncertaintyStyles =
    trend.uncertaintyRisk.level === 'Low'
      ? {
          bg: 'bg-[#F0F9F4] dark:bg-[#263628]',
          border: 'border-[#CDEBD9] dark:border-[#395439]',
          badgeBg: 'bg-[#166534] dark:bg-[#81B64C] text-[#FFFFFF] dark:text-[#191815]',
          titleText: 'text-[#166534] dark:text-[#81B64C]',
        }
      : trend.uncertaintyRisk.level === 'Moderate'
      ? {
          bg: 'bg-[#FDF7ED] dark:bg-[#3C2F1E]',
          border: 'border-[#F4DFB8] dark:border-[#5C4629]',
          badgeBg: 'bg-[#9A4D09] dark:bg-[#FBBF24] text-[#FFFFFF] dark:text-[#191815]',
          titleText: 'text-[#9A4D09] dark:text-[#FBBF24]',
        }
      : {
          bg: 'bg-[#FDF2F2] dark:bg-[#3A2525]',
          border: 'border-[#F3CFCF] dark:border-[#5E3535]',
          badgeBg: 'bg-[#991B1B] dark:bg-[#F87171] text-[#FFFFFF] dark:text-[#191815]',
          titleText: 'text-[#991B1B] dark:text-[#F87171]',
        };

  const pillars = [
    {
      label: c.hoverRemix,
      score: trend.scoreBreakdown.remixVelocity,
      max: 30,
      proof: `${trend.scoreBreakdown.remixes7d} ${c.remixesUnit}`,
    },
    {
      label: c.hoverCross,
      score: trend.scoreBreakdown.crossPlatformJump,
      max: 25,
      proof: trend.scoreBreakdown.platformsCrossedDays,
    },
    {
      label: c.hoverIntent,
      score: trend.scoreBreakdown.audienceIntent,
      max: 25,
      proof: `${trend.scoreBreakdown.saveShareRatio} save+share`,
    },
    {
      label: c.hoverLift,
      score: trend.scoreBreakdown.smallAccountLift,
      max: 20,
      proof: `${trend.scoreBreakdown.anomalyMultiplier} lift`,
    },
  ];

  const lifecyclePct = Math.min(100, Math.max(8, Math.round((trend.daysSinceT0 / 21) * 100)));

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#22201D]/30 dark:bg-black/55 backdrop-blur-[2px] animate-backdrop-in"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={trend.title}
        className="relative z-10 w-full max-w-[630px] h-full rounded-l-[22px] bg-[#FFFFFF] dark:bg-[#2E2C28] shadow-drawer border-l border-[#EAE4D9] dark:border-[#3E3B35] flex flex-col overflow-hidden animate-drawer-in"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-[#FFFFFF] dark:bg-[#2E2C28] border-b border-[#EAE4D9] dark:border-[#3E3B35] shrink-0 space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {rankNumber !== undefined && (
                <span className="font-mono text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-[#1F6F43] dark:bg-[#81B64C] text-[#FFFFFF] dark:text-[#191815]">
                  #{String(rankNumber).padStart(2, '0')}
                </span>
              )}
              <CategoryTag category={trend.category} lang={lang} />
              <MarketBadge market={trend.market} />
              <MaturityBadge
                maturity={trend.maturity}
                eraLabel={trend.pastEraMetadata?.eraLabel}
                compact
                lang={lang}
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled={!canNavigatePrev}
                onClick={onNavigatePrev}
                className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium bg-[#FBF9F4] dark:bg-[#24221F] hover:bg-[#F4F0E8] dark:hover:bg-[#383632] text-[#22201D] dark:text-[#F5F2EC] border border-[#EAE4D9] dark:border-[#3E3B35] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{c.prevBtn}</span>
              </button>
              <button
                type="button"
                disabled={!canNavigateNext}
                onClick={onNavigateNext}
                className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium bg-[#FBF9F4] dark:bg-[#24221F] hover:bg-[#F4F0E8] dark:hover:bg-[#383632] text-[#22201D] dark:text-[#F5F2EC] border border-[#EAE4D9] dark:border-[#3E3B35] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
              >
                <span>{c.nextBtn}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label={c.closeBtn}
                className="p-1.5 ml-1 rounded-full text-[#625C53] dark:text-[#B5AFA4] hover:text-[#22201D] dark:hover:text-[#F5F2EC] hover:bg-[#F4F0E8] dark:hover:bg-[#383632] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h2 className="font-display text-[20px] font-bold text-[#22201D] dark:text-[#F5F2EC] leading-[1.25]">
            {trend.title}
          </h2>

          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
            {!trend.isPastTrend ? (
              <div className="flex items-center gap-2">
                <label
                  htmlFor="drawer-watchlist-select"
                  className="text-[12px] text-[#625C53] dark:text-[#B5AFA4]"
                >
                  {c.statusLabel}
                </label>
                <select
                  id="drawer-watchlist-select"
                  value={trend.watchlistStatus}
                  onChange={(e) =>
                    onChangeWatchlist(
                      trend.id,
                      e.target.value as WatchlistStatus
                    )
                  }
                  className="h-[32px] px-3 rounded-full text-[12px] font-medium bg-[#FBF9F4] dark:bg-[#24221F] text-[#22201D] dark:text-[#F5F2EC] border border-[#EAE4D9] dark:border-[#3E3B35] focus:border-[#1F6F43] focus:outline-none"
                >
                  {WATCHLIST_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {translateWatchlist(status, lang)}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8EFEF] dark:bg-[#3A2727] border border-[#EAD4D4] dark:border-[#5D3838] text-[11.5px] font-medium text-[#8E3535] dark:text-[#F29C9C]">
                <History className="w-3.5 h-3.5" />
                <span>{c.archivedPill}</span>
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#FFFFFF] dark:bg-[#24221F] hover:bg-[#FBF9F4] dark:hover:bg-[#383632] text-[#22201D] dark:text-[#F5F2EC] border border-[#EAE4D9] dark:border-[#3E3B35] transition-colors"
              >
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-[#1F6F43] dark:text-[#81B64C]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#625C53] dark:text-[#B5AFA4]" />
                )}
                <span>{copiedLink ? c.copied : c.copyLink}</span>
              </button>

              <button
                type="button"
                onClick={handleExportMarkdown}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold bg-[#1F6F43] hover:bg-[#185B36] dark:bg-[#81B64C] dark:hover:bg-[#93C75D] text-[#FFFFFF] dark:text-[#191815] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{c.exportOnePager}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* 4-Pillar Scorecard */}
          <section className="space-y-3.5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-[14px] bg-[#FBF9F4] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35]">
              <div>
                <div className="text-[11px] text-[#625C53] dark:text-[#B5AFA4]">
                  {c.colScore}
                </div>
                <div className="font-mono text-[19px] font-bold text-[#22201D] dark:text-[#F5F2EC] mt-0.5 tabular-nums">
                  {trend.emergenceScore}
                  <span className="text-[11px] font-normal text-[#625C53] dark:text-[#B5AFA4]">
                    /100
                  </span>
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#625C53] dark:text-[#B5AFA4]">
                  {c.velocityLabel}
                </div>
                <div
                  className={`font-mono text-[16px] font-semibold mt-1 tabular-nums ${
                    trend.velocity7d >= 0
                      ? 'text-[#1F6F43] dark:text-[#81B64C]'
                      : 'text-[#991B1B] dark:text-[#F87171]'
                  }`}
                >
                  {trend.velocity7d >= 0
                    ? `+${trend.velocity7d}%`
                    : `${trend.velocity7d}%`}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#625C53] dark:text-[#B5AFA4]">
                  {c.hoverLift}
                </div>
                <div className="font-mono text-[16px] font-semibold text-[#22201D] dark:text-[#F5F2EC] mt-1 tabular-nums">
                  {trend.scoreBreakdown.anomalyMultiplier}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#625C53] dark:text-[#B5AFA4]">
                  t0
                </div>
                <div className="font-mono text-[13px] font-semibold text-[#22201D] dark:text-[#F5F2EC] mt-1.5">
                  {trend.t0Date}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-[14px] bg-[#FFFFFF] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12.5px] font-semibold text-[#22201D] dark:text-[#F5F2EC]">
                  {c.scoreCardTitle}
                </span>
                <CertaintyBadge certainty={trend.certainty} lang={lang} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pillars.map((p) => {
                  const pct = Math.min(100, Math.round((p.score / p.max) * 100));
                  return (
                    <div
                      key={p.label}
                      className="p-3 rounded-[10px] bg-[#FBF9F4] dark:bg-[#2E2C28] border border-[#EAE4D9] dark:border-[#3E3B35] space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 text-[11.5px]">
                        <span className="font-medium text-[#22201D] dark:text-[#F5F2EC]">
                          {p.label}
                        </span>
                        <span className="font-mono font-semibold text-[#1F6F43] dark:text-[#81B64C] tabular-nums">
                          {p.score}/{p.max}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#EAE4D9] dark:bg-[#43403A] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            trend.isPastTrend
                              ? 'bg-[#991B1B] dark:bg-[#F29C9C]'
                              : trend.maturity === 'Early Spark'
                              ? 'bg-[#B45309] dark:bg-[#FBBF24]'
                              : 'bg-[#1F6F43] dark:bg-[#81B64C]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="font-mono text-[10.5px] text-[#625C53] dark:text-[#B5AFA4]">
                        {p.proof}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!trend.isPastTrend ? (
                <div className="pt-2.5 border-t border-[#EAE4D9] dark:border-[#3E3B35] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-[#22201D] dark:text-[#F5F2EC]">
                      {c.lifecycleTitle}
                    </span>
                    <span className="font-mono font-semibold text-[#1F6F43] dark:text-[#81B64C]">
                      {trend.daysSinceT0}{lang === 'fr' ? 'j' : 'd'} {c.dayOf21}
                    </span>
                  </div>
                  <div className="relative h-2 rounded-full bg-[#F4F0E8] dark:bg-[#43403A] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        trend.daysSinceT0 <= 7
                          ? 'bg-[#B45309] dark:bg-[#FBBF24]'
                          : 'bg-[#1F6F43] dark:bg-[#81B64C]'
                      }`}
                      style={{ width: `${lifecyclePct}%` }}
                    />
                  </div>
                </div>
              ) : (
                trend.pastEraMetadata && (
                  <div className="pt-3 border-t border-[#EAE4D9] dark:border-[#3E3B35]">
                    <div className="p-3.5 rounded-[12px] bg-[#FAF4F4] dark:bg-[#3A2727] border border-[#EAD4D4] dark:border-[#5D3838] space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-semibold text-[#8E3535] dark:text-[#F29C9C]">
                          {c.pastPostMortemTitle}
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-[#8E3535] dark:text-[#F29C9C]">
                          {trend.pastEraMetadata.eraLabel}
                        </span>
                      </div>
                      <div className="text-[11.5px] text-[#373633] dark:text-[#E5DFD5]">
                        <strong>{c.peakScaleLabel}:</strong> {trend.pastEraMetadata.peakScale}
                      </div>
                      <div className="text-[11.5px] text-[#373633] dark:text-[#E5DFD5]">
                        <strong>{c.lifespanLabel}:</strong> {trend.pastEraMetadata.lifespanLabel}
                      </div>
                      <p className="text-[12px] text-[#373633] dark:text-[#E5DFD5] leading-[1.4]">
                        <strong className="text-[#8E3535] dark:text-[#F29C9C]">
                          {c.whyFadedLabel}:
                        </strong>{' '}
                        {trend.pastEraMetadata.whyItFaded}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>

          {/* 16:9 Viral Video Card */}
          <section className="pt-6 border-t border-[#EAE4D9] dark:border-[#3E3B35] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-[#22201D] dark:text-[#F5F2EC]">
                {trend.isPastTrend ? c.pastVideoTitle : c.viralVideoTitle}
              </h3>
              <span className="font-mono text-[11px] text-[#625C53] dark:text-[#B5AFA4]">
                {trend.viralVideo.uploadedAgo} · {trend.viralVideo.uploadDate}
              </span>
            </div>

            <div className="rounded-[16px] border border-[#EAE4D9] dark:border-[#3E3B35] overflow-hidden bg-[#FFFFFF] dark:bg-[#24221F]">
              <div
                onClick={() => setPreviewExpanded((p) => !p)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPreviewExpanded((p) => !p);
                  }
                }}
                className="relative aspect-video w-full overflow-hidden cursor-pointer group select-none bg-[#22201D]"
              >
                <div className="absolute inset-0">
                  <TrendThumbnail trend={trend} variant="hero" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#191815]/92 via-[#191815]/35 to-[#191815]/25" />

                <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#191815]/85 text-[#FFFFFF] font-mono text-[11px] font-medium border border-[#FFFFFF]/15">
                      {trend.viralVideo.platform}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFFFFF]/90 text-[#22201D] font-mono text-[10px] font-semibold">
                      {trend.viralVideo.thumbnailTheme.aspectLabel}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#191815]/85 text-[#FFFFFF] font-mono text-[11px] border border-[#FFFFFF]/15">
                    {trend.viralVideo.duration}
                  </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#FFFFFF] text-[#1F6F43] flex items-center justify-center shadow-elevated transition-transform duration-150 group-hover:scale-105">
                    <Play className="w-4 h-4 translate-x-[1px] fill-current" strokeWidth={1.5} />
                  </div>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-4 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] tracking-[0.06em] text-[#EAE4D9]">
                      {trend.viralVideo.thumbnailTheme.frameCode} ·{' '}
                      {trend.viralVideo.thumbnailTheme.captionOverlay}
                    </div>
                    <div className="text-[15px] font-semibold text-[#FFFFFF] leading-[1.3] mt-1 line-clamp-2">
                      {trend.viralVideo.title}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-[14px] font-semibold text-[#FFFFFF]">
                      {trend.viralVideo.viewsFormatted} {c.viewsUnit}
                    </div>
                    <div className="font-mono text-[11px] text-[#EAE4D9]">
                      {trend.viralVideo.engagementRate} {c.engUnit}
                    </div>
                  </div>
                </div>
              </div>

              {previewExpanded && (
                <div className="p-3.5 bg-[#FBF9F4] dark:bg-[#1D1B18] border-b border-[#EAE4D9] dark:border-[#3E3B35] space-y-2 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#22201D] dark:text-[#F5F2EC] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#625C53]" />
                      <span>{c.retentionLabel}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewExpanded(false)}
                      className="text-[11px] text-[#625C53] dark:text-[#B5AFA4] hover:text-[#22201D] dark:hover:text-[#F5F2EC]"
                    >
                      {c.closeBtn}
                    </button>
                  </div>
                  <div className="p-2.5 rounded-[10px] bg-[#FFFFFF] dark:bg-[#2E2C28] border border-[#EAE4D9] dark:border-[#3E3B35] space-y-1.5">
                    <div className="flex items-center justify-between font-mono text-[10px] text-[#625C53] dark:text-[#B5AFA4]">
                      <span>00:00 HOOK</span>
                      <span className="text-[#1F6F43] dark:text-[#81B64C] font-semibold">
                        PEAK REPLAY
                      </span>
                      <span>{trend.viralVideo.duration}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#EAE4D9] dark:bg-[#43403A] overflow-hidden flex">
                      <div className="w-[32%] bg-[#22201D] dark:bg-[#F5F2EC]" />
                      <div className="w-[42%] bg-[#1F6F43] dark:bg-[#81B64C]" />
                      <div className="w-[26%] bg-[#A59D90]" />
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <a
                    href={trend.viralVideo.creator.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[12.5px] text-[#22201D] dark:text-[#F5F2EC] hover:underline"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#1F6F43] dark:text-[#81B64C]" />
                    <span className="font-mono font-semibold">
                      {trend.viralVideo.creator.handle}
                    </span>
                    <span className="text-[#625C53] dark:text-[#B5AFA4]">
                      · {trend.viralVideo.creator.followers}
                    </span>
                  </a>

                  <a
                    href={trend.viralVideo.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[12px] font-semibold bg-[#1F6F43] hover:bg-[#185B36] dark:bg-[#81B64C] dark:hover:bg-[#93C75D] text-[#FFFFFF] dark:text-[#191815] transition-colors"
                  >
                    <span>{c.watchVideo}</span>
                  </a>
                </div>

                <div className="pt-3 border-t border-[#EAE4D9] dark:border-[#3E3B35] space-y-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {trend.platforms.map((p) => (
                      <PlatformMiniBadge key={p} platform={p} />
                    ))}
                    {trend.audiences.map((aud) => (
                      <span
                        key={aud}
                        className="px-2.5 py-0.5 rounded-full text-[11px] bg-[#FBF9F4] dark:bg-[#2E2C28] text-[#625C53] dark:text-[#B5AFA4] border border-[#EAE4D9] dark:border-[#3E3B35]"
                      >
                        {aud}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {trend.hashtags.length > 0 ? (
                      trend.hashtags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => onClickHashtag(tag)}
                          className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] bg-[#FBF9F4] dark:bg-[#2E2C28] hover:bg-[#F4F0E8] dark:hover:bg-[#3A3834] text-[#625C53] dark:text-[#B5AFA4] border border-[#EAE4D9] dark:border-[#3E3B35] transition-colors"
                        >
                          <Hash className="w-2.5 h-2.5 text-[#8E877D]" />
                          <span>{tag}</span>
                        </button>
                      ))
                    ) : (
                      <span className="text-[12px] italic text-[#625C53] dark:text-[#B5AFA4]">
                        {c.noHashtag}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Editorial Recommendation Callout — Warm Deep Botanical Forest Green */}
          <section className="pt-6 border-t border-[#EAE4D9] dark:border-[#3E3B35]">
            <div className="rounded-[16px] bg-[#193829] dark:bg-[#1E3326] text-[#F5F2EC] p-5 space-y-2.5 border border-[#2C5540]">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.06em] text-[#86EFAC] dark:text-[#81B64C]">
                <Compass className="w-3.5 h-3.5" />
                <span>{c.recTitle}</span>
              </div>
              <div className="font-display text-[15.5px] font-bold text-[#FFFFFF] leading-[1.35]">
                {trend.recommendation.headline}
              </div>
              <p className="text-[13px] text-[#DCE8E0] leading-[1.55]">
                {trend.recommendation.rationale}
              </p>
              <div className="pt-3 border-t border-[#2C5540] grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.05em] text-[#9CC3AD]">
                    {c.recFormat}
                  </div>
                  <div className="text-[#FFFFFF] font-medium mt-0.5">
                    {trend.recommendation.suggestedFormat}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.05em] text-[#9CC3AD]">
                    {c.recPole}
                  </div>
                  <div className="text-[#FFFFFF] font-medium mt-0.5">
                    {trend.recommendation.targetPole}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.05em] text-[#9CC3AD]">
                    {c.recWindow}
                  </div>
                  <div className="text-[#FFFFFF] font-medium mt-0.5">
                    {trend.recommendation.targetWindow}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Drivers vs Limits */}
          <section className="pt-6 border-t border-[#EAE4D9] dark:border-[#3E3B35] space-y-3.5">
            <h3 className="text-[13px] font-semibold text-[#22201D] dark:text-[#F5F2EC]">
              {c.growthTitle}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-[14px] bg-[#FBF9F4] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35] space-y-2">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#1F6F43] dark:text-[#81B64C]">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{c.driversTitle}</span>
                </div>
                <ul className="space-y-1.5">
                  {trend.drivers.map((drv, i) => (
                    <li
                      key={i}
                      className="text-[12px] text-[#373633] dark:text-[#D5D1C8] leading-[1.45] flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1F6F43] dark:bg-[#81B64C] mt-1.5 shrink-0" />
                      <span>{drv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-[14px] bg-[#FBF9F4] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35] space-y-2">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#991B1B] dark:text-[#F87171]">
                  <MinusCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{c.limitsTitle}</span>
                </div>
                <ul className="space-y-1.5">
                  {trend.limits.map((lim, i) => (
                    <li
                      key={i}
                      className="text-[12px] text-[#373633] dark:text-[#D5D1C8] leading-[1.45] flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#991B1B] dark:bg-[#F87171] mt-1.5 shrink-0" />
                      <span>{lim}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-[14px] border ${uncertaintyStyles.bg} ${uncertaintyStyles.border} space-y-1.5`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-[12px] font-semibold ${uncertaintyStyles.titleText}`}
                >
                  {trend.uncertaintyRisk.level === 'High Uncertainty' ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : (
                    <ShieldAlert className="w-3.5 h-3.5" />
                  )}
                  <span>{c.uncertaintyTitle}</span>
                </span>
                <span
                  className={`font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${uncertaintyStyles.badgeBg}`}
                >
                  {trend.uncertaintyRisk.level}
                </span>
              </div>
              <p className="text-[12px] text-[#22201D] dark:text-[#F5F2EC] leading-[1.45]">
                {trend.uncertaintyRisk.explanation}
              </p>
              <p className="text-[11px] text-[#625C53] dark:text-[#B5AFA4] leading-[1.4]">
                <strong className="font-medium text-[#22201D] dark:text-[#F5F2EC]">
                  {c.missingData}
                </strong>{' '}
                {trend.uncertaintyRisk.missingData}
              </p>
            </div>
          </section>

          {/* Cross-Platform Trajectory Chart */}
          <section className="pt-6 border-t border-[#EAE4D9] dark:border-[#3E3B35] space-y-3">
            <h3 className="text-[13px] font-semibold text-[#22201D] dark:text-[#F5F2EC]">
              {c.trajectoryTitle}
            </h3>

            <div className="p-4 rounded-[14px] bg-[#FFFFFF] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35]">
              <div className="flex flex-wrap items-center gap-4 mb-3 text-[11px] text-[#6B6A65] dark:text-[#ABA89F]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-[2px] bg-[#D9822B]" />
                  <span>Niche Incubator</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-[2px] bg-[#141413] dark:bg-[#E5E2D9]" />
                  <span>Social Velocity</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-[2px] bg-[#166534] dark:bg-[#81B64C]" />
                  <span>Google Trends</span>
                </span>
              </div>

              <div className="h-[196px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trend.trajectory}
                    margin={{ top: 8, right: 18, left: -22, bottom: 0 }}
                  >
                    <CartesianGrid
                      stroke="#7F7D75"
                      strokeOpacity={0.2}
                      vertical={false}
                      strokeWidth={1}
                    />
                    <XAxis
                      dataKey="dayLabel"
                      tick={{
                        fontSize: 11,
                        fill: '#8C8A82',
                        fontFamily: 'JetBrains Mono',
                      }}
                      axisLine={{ stroke: '#6E6B64' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{
                        fontSize: 11,
                        fill: '#8C8A82',
                        fontFamily: 'JetBrains Mono',
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#262522',
                        border: '1px solid #45423C',
                        borderRadius: '6px',
                        color: '#F3F2EE',
                        fontSize: '12px',
                        fontFamily: 'JetBrains Mono',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="nicheIncubator"
                      name="Niche Incubator"
                      stroke="#D9822B"
                      strokeWidth={1.75}
                      fill="#D9822B"
                      fillOpacity={0.14}
                      isAnimationActive={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="socialVelocity"
                      name="Social Velocity"
                      stroke="#7D7B74"
                      strokeWidth={2}
                      fill="#7D7B74"
                      fillOpacity={0.12}
                      isAnimationActive={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="mainstreamSearch"
                      name="Google Trends"
                      stroke="#55A852"
                      strokeWidth={2}
                      fill="#55A852"
                      fillOpacity={0.18}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Team Votes */}
          <section className="pt-6 border-t border-[#EAE4D9] dark:border-[#3E3B35] space-y-3.5 pb-4">
            <h3 className="text-[13px] font-semibold text-[#22201D] dark:text-[#F5F2EC]">
              {c.teamVotesTitle} ({trend.votes.length})
            </h3>

            {trend.votes.length === 0 ? (
              <div className="p-3.5 rounded-[12px] bg-[#FBF9F4] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35] text-[12px] text-[#625C53] dark:text-[#B5AFA4]">
                {c.noVotesYet}
              </div>
            ) : (
              <div className="space-y-2">
                {trend.votes.map((vote) => (
                  <div
                    key={vote.id}
                    className="p-3.5 rounded-[12px] bg-[#FBF9F4] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35] space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ColleagueAvatar
                          initials={vote.initials}
                          title={`${vote.colleagueName} (${vote.pole})`}
                          size="xs"
                        />
                        <span className="text-[12.5px] font-semibold text-[#22201D] dark:text-[#F5F2EC]">
                          {vote.colleagueName}
                        </span>
                        <span className="text-[11px] text-[#625C53] dark:text-[#B5AFA4]">
                          {vote.pole}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[#8E877D]">
                        {vote.timestamp}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-[#373633] dark:text-[#D5D1C8] leading-[1.45] pl-7">
                      “{vote.rationale}”
                    </p>
                  </div>
                ))}
              </div>
            )}

            <form
              ref={voteFormRef}
              onSubmit={handleVoteSubmit}
              className="p-4 rounded-[14px] bg-[#FFFFFF] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35] space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12.5px] font-semibold text-[#22201D] dark:text-[#F5F2EC]">
                  {trend.isPastTrend ? c.addArchiveNoteTitle : c.castVoteTitle}
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  {COLLEAGUE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setVoterName(preset.name);
                        setVoterPole(preset.pole);
                      }}
                      className={`px-2.5 py-0.5 rounded-full text-[10.5px] border transition-colors ${
                        voterName === preset.name
                          ? 'bg-[#1F6F43] dark:bg-[#81B64C] text-[#FFFFFF] dark:text-[#191815] border-[#1F6F43] dark:border-[#81B64C]'
                          : 'bg-[#FBF9F4] dark:bg-[#2E2C28] text-[#625C53] dark:text-[#B5AFA4] border-[#EAE4D9] dark:border-[#3E3B35] hover:text-[#22201D] dark:hover:text-[#F5F2EC]'
                      }`}
                    >
                      {preset.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  placeholder={c.yourName}
                  aria-label={c.yourName}
                  className="h-[34px] px-3 rounded-xl bg-[#FBF9F4] dark:bg-[#2E2C28] border border-[#EAE4D9] dark:border-[#3E3B35] focus:border-[#1F6F43] focus:outline-none text-[12px] text-[#22201D] dark:text-[#F5F2EC]"
                />
                <select
                  value={voterPole}
                  onChange={(e) => setVoterPole(e.target.value)}
                  aria-label="Mediawan pole"
                  className="h-[34px] px-3 rounded-xl bg-[#FBF9F4] dark:bg-[#2E2C28] border border-[#EAE4D9] dark:border-[#3E3B35] focus:border-[#1F6F43] focus:outline-none text-[12px] text-[#22201D] dark:text-[#F5F2EC]"
                >
                  {MEDIAWAN_POLES.map((pole) => (
                    <option key={pole} value={pole}>
                      {pole}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                ref={rationaleInputRef}
                rows={2}
                value={voteRationale}
                onChange={(e) => {
                  setVoteRationale(e.target.value);
                  if (voteError) setVoteError(null);
                }}
                placeholder={c.whyTrackPlaceholder}
                aria-label={c.whyTrackPlaceholder}
                className="w-full p-3 rounded-xl bg-[#FBF9F4] dark:bg-[#2E2C28] border border-[#EAE4D9] dark:border-[#3E3B35] focus:border-[#1F6F43] focus:outline-none text-[12.5px] text-[#22201D] dark:text-[#F5F2EC] resize-none"
              />

              {voteError && (
                <div className="text-[11.5px] text-[#991B1B] dark:text-[#F87171]">
                  {voteError}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
                    justVoted
                      ? 'bg-[#1F6F43] dark:bg-[#81B64C] text-[#FFFFFF] dark:text-[#191815]'
                      : 'bg-[#1F6F43] hover:bg-[#185B36] dark:bg-[#81B64C] dark:hover:bg-[#93C75D] text-[#FFFFFF] dark:text-[#191815]'
                  }`}
                >
                  {justVoted ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{c.addedVote}</span>
                    </>
                  ) : (
                    <>
                      <ArrowUp className="w-3.5 h-3.5" />
                      <span>{c.submitVote}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      </aside>
    </div>
  );
};
