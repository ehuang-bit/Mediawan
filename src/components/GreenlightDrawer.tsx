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
  VerdictBadge,
} from './SemanticBadges';
import { getVerdict, verdictSentence } from '../utils/verdict';
import { TrendThumbnail } from './TrendThumbnail';
import { exportTrendPdf } from '../utils/exportPdf';
import { translateWatchlist, UI_COPY, tr, translateAge, translateDate } from '../i18n';

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
  const [isExportingPdf, setIsExportingPdf] = useState(false);
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

  const handleExportPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      await exportTrendPdf(trend, lang, rankNumber);
      onShowToast(lang === 'fr' ? 'Fiche PDF téléchargée' : 'PDF brief downloaded');
    } catch {
      onShowToast(lang === 'fr' ? 'Erreur lors de l’export PDF' : 'PDF export failed');
    } finally {
      setIsExportingPdf(false);
    }
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
          bg: 'bg-accent-soft',
          border: 'border-accent-line',
          badgeBg: 'bg-pop text-on-pop',
          titleText: 'text-accent',
        }
      : trend.uncertaintyRisk.level === 'Moderate'
      ? {
          bg: 'bg-warn-soft',
          border: 'border-warn-line',
          badgeBg: 'bg-warn text-surface',
          titleText: 'text-warn',
        }
      : {
          bg: 'bg-danger-soft',
          border: 'border-danger-line',
          badgeBg: 'bg-gold text-on-gold',
          titleText: 'text-danger',
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
        className="fixed inset-0 bg-ink/30 dark:bg-black/55 backdrop-blur-[2px] animate-backdrop-in"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={trend.title}
        className="relative z-10 w-full max-w-[630px] h-full sm:rounded-l-[22px] bg-surface shadow-drawer border-l border-line flex flex-col overflow-hidden animate-drawer-in"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 bg-surface border-b border-line shrink-0 space-y-3.5">
          <div className="flex flex-wrap-reverse items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {rankNumber !== undefined && (
                <span className="font-mono text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-pop text-on-pop">
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
                className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium bg-soft hover:bg-canvas text-ink border border-line disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{c.prevBtn}</span>
              </button>
              <button
                type="button"
                disabled={!canNavigateNext}
                onClick={onNavigateNext}
                className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium bg-soft hover:bg-canvas text-ink border border-line disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
              >
                <span>{c.nextBtn}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label={c.closeBtn}
                className="p-1.5 ml-1 rounded-full text-ink-2 hover:text-ink hover:bg-canvas transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h2 className="font-display text-[20px] font-bold text-ink leading-[1.25]">
            {trend.title}
          </h2>

          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
            {!trend.isPastTrend ? (
              <div className="flex items-center gap-2">
                <label
                  htmlFor="drawer-watchlist-select"
                  className="text-[12px] text-ink-2"
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
                  className="h-[32px] px-3 rounded-full text-[12px] font-medium bg-soft text-ink border border-line focus:border-accent focus:outline-none"
                >
                  {WATCHLIST_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {translateWatchlist(status, lang)}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-danger-soft border border-danger-line text-[11.5px] font-medium text-danger">
                <History className="w-3.5 h-3.5" />
                <span>{c.archivedPill}</span>
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-surface hover:bg-soft text-ink border border-line transition-colors"
              >
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-accent" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-ink-2" />
                )}
                <span>{copiedLink ? c.copied : c.copyLink}</span>
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold bg-pop hover:bg-pop-hover text-on-pop disabled:opacity-60 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  {isExportingPdf
                    ? lang === 'fr'
                      ? 'Génération…'
                      : 'Generating…'
                    : c.exportOnePager}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6">
          {/* Verdict: is it becoming a trend? */}
          {(() => {
            const v = getVerdict(trend, lang);
            const fr = lang === 'fr';
            return (
              <section className="rounded-[16px] border-2 border-edge bg-surface shadow-card overflow-hidden">
                <div className="px-4 py-3.5 bg-soft border-b border-line flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[12px] font-semibold text-ink-2">
                      {fr ? 'Ça devient une tendance ?' : 'Is it becoming a trend?'}
                    </span>
                    <VerdictBadge trend={trend} lang={lang} size="md" />
                  </div>
                  <span className="font-mono text-[12px] font-semibold text-ink tabular-nums">
                    {v.passedCount}/5 {fr ? 'critères' : 'checks'}
                  </span>
                </div>
                <div className="px-4 py-3.5 space-y-3">
                  <p className="text-[13px] font-medium text-ink leading-snug">
                    {verdictSentence(v.verdict, lang)}
                  </p>
                  <ul className="space-y-1.5">
                    {v.checks.map((ck) => (
                      <li key={ck.id} className="flex items-start gap-2 text-[12.5px]">
                        {ck.passed ? (
                          <CheckCircle2 className="w-4 h-4 mt-px shrink-0 text-accent" />
                        ) : (
                          <MinusCircle className="w-4 h-4 mt-px shrink-0 text-ink-3" />
                        )}
                        <span className={ck.passed ? 'text-ink' : 'text-ink-2'}>
                          <span className="font-semibold">{ck.label}</span>
                          <span className="text-ink-2"> · {ck.detail}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  {!trend.isPastTrend && (
                    <div className="pt-3 border-t border-line grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[12px]">
                      <div>
                        <div className="text-ink-3">{fr ? 'Décision éclairée' : 'Decision informed'}</div>
                        <div className="font-semibold text-ink">{v.decisionType}</div>
                      </div>
                      <div>
                        <div className="text-ink-3">{fr ? 'Équipe concernée' : 'Team'}</div>
                        <div className="font-semibold text-ink">{trend.recommendation.targetPole}</div>
                      </div>
                      <div>
                        <div className="text-ink-3">{fr ? 'Fenêtre' : 'Window'}</div>
                        <div className="font-semibold text-ink">{tr(trend.recommendation.targetWindow, lang)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            );
          })()}

          {/* 4-Pillar Scorecard */}
          <section className="space-y-3.5">
            <div className="grid grid-cols-3 gap-3 p-4 rounded-[14px] bg-soft border border-line">
              <div>
                <div className="text-[11px] text-ink-2">
                  {c.colScore}
                </div>
                <div className="font-mono text-[19px] font-bold text-ink mt-0.5 tabular-nums">
                  {trend.emergenceScore}
                  <span className="text-[11px] font-normal text-ink-2">
                    /100
                  </span>
                </div>
              </div>
              <div>
                <div className="text-[11px] text-ink-2">
                  {c.velocityLabel}
                </div>
                <div
                  className={`font-mono text-[16px] font-semibold mt-1 tabular-nums ${
                    trend.velocity7d >= 0
                      ? 'text-accent'
                      : 'text-danger'
                  }`}
                >
                  {trend.velocity7d >= 0
                    ? `+${trend.velocity7d}%`
                    : `${trend.velocity7d}%`}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-ink-2">
                  t0
                </div>
                <div className="font-mono text-[13px] font-semibold text-ink mt-1.5">
                  {trend.t0Date}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-[14px] bg-surface border border-line space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12.5px] font-semibold text-ink">
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
                      className="p-3 rounded-[10px] bg-soft border border-line space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 text-[11.5px]">
                        <span className="font-medium text-ink">
                          {p.label}
                        </span>
                        <span className="font-mono font-semibold text-accent tabular-nums">
                          {p.score}/{p.max}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-line overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            trend.isPastTrend
                              ? 'bg-gold'
                              : trend.maturity === 'Early Spark'
                              ? 'bg-warn'
                              : 'bg-pop'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="font-mono text-[11px] text-ink-2">
                        {p.proof}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!trend.isPastTrend ? (
                <div className="pt-2.5 border-t border-line space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-ink">
                      {c.lifecycleTitle}
                    </span>
                    <span className="font-mono font-semibold text-accent">
                      {trend.daysSinceT0}{lang === 'fr' ? 'j' : 'd'} {c.dayOf21}
                    </span>
                  </div>
                  <div className="relative h-2 rounded-full bg-canvas overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        trend.daysSinceT0 <= 7
                          ? 'bg-warn'
                          : 'bg-pop'
                      }`}
                      style={{ width: `${lifecyclePct}%` }}
                    />
                  </div>
                </div>
              ) : (
                trend.pastEraMetadata && (
                  <div className="pt-3 border-t border-line">
                    <div className="p-3.5 rounded-[12px] bg-danger-soft border border-danger-line space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-semibold text-danger">
                          {c.pastPostMortemTitle}
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-danger">
                          {trend.pastEraMetadata.eraLabel}
                        </span>
                      </div>
                      <div className="text-[11.5px] text-ink-2">
                        <strong>{c.peakScaleLabel}:</strong> {trend.pastEraMetadata.peakScale}
                      </div>
                      <div className="text-[11.5px] text-ink-2">
                        <strong>{c.lifespanLabel}:</strong> {trend.pastEraMetadata.lifespanLabel}
                      </div>
                      <p className="text-[12px] text-ink-2 leading-[1.4]">
                        <strong className="text-danger">
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
          <section className="pt-6 border-t border-line space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-ink">
                {trend.isPastTrend ? c.pastVideoTitle : c.viralVideoTitle}
              </h3>
              <span className="font-mono text-[11px] text-ink-2">
                {translateAge(trend.viralVideo.uploadedAgo, lang)} · {translateDate(trend.viralVideo.uploadDate, lang)}
              </span>
            </div>

            <div className="rounded-[16px] border border-line overflow-hidden bg-surface">
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
                className="relative aspect-video w-full overflow-hidden cursor-pointer group select-none bg-[#1D1D1F]"
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
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFFFFF]/90 text-[#1D1D1F] font-mono text-[11px] font-semibold">
                      {trend.viralVideo.thumbnailTheme.aspectLabel}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#191815]/85 text-[#FFFFFF] font-mono text-[11px] border border-[#FFFFFF]/15">
                    {trend.viralVideo.duration}
                  </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#FFFFFF] text-[#1D1D1F] flex items-center justify-center shadow-elevated transition-transform duration-150 group-hover:scale-105">
                    <Play className="w-4 h-4 translate-x-[1px] fill-current" strokeWidth={1.5} />
                  </div>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-4 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-mono text-[11px] tracking-[0.06em] text-[#EAE4D9]">
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
                <div className="p-3.5 bg-soft border-b border-line space-y-2 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ink flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-ink-2" />
                      <span>{c.retentionLabel}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewExpanded(false)}
                      className="text-[11px] text-ink-2 hover:text-ink"
                    >
                      {c.closeBtn}
                    </button>
                  </div>
                  <div className="p-2.5 rounded-[10px] bg-surface border border-line space-y-1.5">
                    <div className="flex items-center justify-between font-mono text-[11px] text-ink-2">
                      <span>00:00 HOOK</span>
                      <span className="text-accent font-semibold">
                        {tr('PEAK REPLAY', lang)}
                      </span>
                      <span>{trend.viralVideo.duration}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-line overflow-hidden flex">
                      <div className="w-[32%] bg-ink" />
                      <div className="w-[42%] bg-pop" />
                      <div className="w-[26%] bg-ink-3" />
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
                    className="inline-flex items-center gap-2 text-[12.5px] text-ink hover:underline"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-accent" />
                    <span className="font-mono font-semibold">
                      {trend.viralVideo.creator.handle}
                    </span>
                    <span className="text-ink-2">
                      · {trend.viralVideo.creator.followers}
                    </span>
                  </a>

                  <a
                    href={trend.viralVideo.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[12px] font-semibold bg-pop hover:bg-pop-hover text-on-pop transition-colors"
                  >
                    <span>{c.watchVideo}</span>
                  </a>
                </div>

                <div className="pt-3 border-t border-line space-y-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {trend.platforms.map((p) => (
                      <PlatformMiniBadge key={p} platform={p} />
                    ))}
                    {trend.audiences.map((aud) => (
                      <span
                        key={aud}
                        className="px-2.5 py-0.5 rounded-full text-[11px] bg-soft text-ink-2 border border-line"
                      >
                        {tr(aud, lang)}
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
                          className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] bg-soft hover:bg-canvas text-ink-2 border border-line transition-colors"
                        >
                          <Hash className="w-2.5 h-2.5 text-ink-3" />
                          <span>{tag}</span>
                        </button>
                      ))
                    ) : (
                      <span className="text-[12px] italic text-ink-2">
                        {c.noHashtag}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Editorial Recommendation Callout — lilac sticker */}
          <section className="pt-6 border-t border-line">
            <div className="rounded-[16px] bg-lilac text-on-pop sticker p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.06em] text-on-pop">
                <Compass className="w-3.5 h-3.5" />
                <span>{c.recTitle}</span>
              </div>
              <div className="font-display text-[15.5px] font-bold text-on-pop leading-[1.35]">
                {trend.recommendation.headline}
              </div>
              <p className="text-[13px] text-on-pop leading-[1.55]">
                {trend.recommendation.rationale}
              </p>
              <div className="pt-3 border-t border-on-pop/25 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.05em] text-on-pop">
                    {c.recFormat}
                  </div>
                  <div className="text-on-pop font-medium mt-0.5">
                    {trend.recommendation.suggestedFormat}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.05em] text-on-pop">
                    {c.recPole}
                  </div>
                  <div className="text-on-pop font-medium mt-0.5">
                    {trend.recommendation.targetPole}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.05em] text-on-pop">
                    {c.recWindow}
                  </div>
                  <div className="text-on-pop font-medium mt-0.5">
                    {trend.recommendation.targetWindow}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Drivers vs Limits */}
          <section className="pt-6 border-t border-line space-y-3.5">
            <h3 className="text-[13px] font-semibold text-ink">
              {c.growthTitle}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-[14px] bg-soft border border-line space-y-2">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-accent">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{c.driversTitle}</span>
                </div>
                <ul className="space-y-1.5">
                  {trend.drivers.map((drv, i) => (
                    <li
                      key={i}
                      className="text-[12px] text-ink-2 leading-[1.45] flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-pop mt-1.5 shrink-0" />
                      <span>{drv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-[14px] bg-soft border border-line space-y-2">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-danger">
                  <MinusCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{c.limitsTitle}</span>
                </div>
                <ul className="space-y-1.5">
                  {trend.limits.map((lim, i) => (
                    <li
                      key={i}
                      className="text-[12px] text-ink-2 leading-[1.45] flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
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
                  {tr(trend.uncertaintyRisk.level, lang)}
                </span>
              </div>
              <p className="text-[12px] text-ink leading-[1.45]">
                {trend.uncertaintyRisk.explanation}
              </p>
              <p className="text-[11px] text-ink-2 leading-[1.4]">
                <strong className="font-medium text-ink">
                  {c.missingData}
                </strong>{' '}
                {trend.uncertaintyRisk.missingData}
              </p>
            </div>
          </section>

          {/* Cross-Platform Trajectory Chart */}
          <section className="pt-6 border-t border-line space-y-3">
            <h3 className="text-[13px] font-semibold text-ink">
              {c.trajectoryTitle}
            </h3>

            <div className="p-4 rounded-[14px] bg-surface border border-line">
              <div className="flex flex-wrap items-center gap-4 mb-3 text-[11px] text-ink-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-[3px] bg-pop" />
                  <span>{tr('Niche Incubator', lang)}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-[2px] bg-ink" />
                  <span>{tr('Social Velocity', lang)}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-[3px] bg-[#8F78F5]" />
                  <span>{tr('Google Trends', lang)}</span>
                </span>
              </div>

              <div className="h-[196px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trend.trajectory}
                    margin={{ top: 8, right: 18, left: -22, bottom: 0 }}
                  >
                    <CartesianGrid
                      stroke="var(--mw-line)"
                      strokeOpacity={0.2}
                      vertical={false}
                      strokeWidth={1}
                    />
                    <XAxis
                      dataKey="dayLabel"
                      tick={{
                        fontSize: 11,
                        fill: 'var(--mw-ink-3)',
                        fontFamily: 'JetBrains Mono',
                      }}
                      axisLine={{ stroke: 'var(--mw-line)' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{
                        fontSize: 11,
                        fill: 'var(--mw-ink-3)',
                        fontFamily: 'JetBrains Mono',
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--mw-surface)',
                        border: '2px solid var(--mw-edge)',
                        borderRadius: '6px',
                        color: 'var(--mw-ink)',
                        fontSize: '12px',
                        fontFamily: 'JetBrains Mono',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="nicheIncubator"
                      name={tr('Niche Incubator', lang)}
                      stroke="#FF6445"
                      strokeWidth={1.75}
                      fill="#FF6445"
                      fillOpacity={0.14}
                      isAnimationActive={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="socialVelocity"
                      name={tr('Social Velocity', lang)}
                      stroke="var(--mw-ink)"
                      strokeWidth={2}
                      fill="var(--mw-ink)"
                      fillOpacity={0.12}
                      isAnimationActive={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="mainstreamSearch"
                      name={tr('Google Trends', lang)}
                      stroke="#8F78F5"
                      strokeWidth={2}
                      fill="#8F78F5"
                      fillOpacity={0.18}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Team Votes */}
          <section className="pt-6 border-t border-line space-y-3.5 pb-4">
            <h3 className="text-[13px] font-semibold text-ink">
              {c.teamVotesTitle} ({trend.votes.length})
            </h3>

            {trend.votes.length === 0 ? (
              <div className="p-3.5 rounded-[12px] bg-soft border border-line text-[12px] text-ink-2">
                {c.noVotesYet}
              </div>
            ) : (
              <div className="space-y-2">
                {trend.votes.map((vote) => (
                  <div
                    key={vote.id}
                    className="p-3.5 rounded-[12px] bg-soft border border-line space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ColleagueAvatar
                          initials={vote.initials}
                          title={`${vote.colleagueName} (${vote.pole})`}
                          size="xs"
                        />
                        <span className="text-[12.5px] font-semibold text-ink">
                          {vote.colleagueName}
                        </span>
                        <span className="text-[11px] text-ink-2">
                          {vote.pole}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-ink-3">
                        {vote.timestamp}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-ink-2 leading-[1.45] pl-7">
                      “{vote.rationale}”
                    </p>
                  </div>
                ))}
              </div>
            )}

            <form
              ref={voteFormRef}
              onSubmit={handleVoteSubmit}
              className="p-4 rounded-[14px] bg-surface border border-line space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12.5px] font-semibold text-ink">
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
                      className={`px-2.5 py-0.5 rounded-full text-[11px] border transition-colors ${
                        voterName === preset.name
                          ? 'bg-pop text-on-pop border-edge'
                          : 'bg-soft text-ink-2 border-line hover:text-ink'
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
                  className="h-[34px] px-3 rounded-xl bg-soft border border-line focus:border-accent focus:outline-none text-[12px] text-ink"
                />
                <select
                  value={voterPole}
                  onChange={(e) => setVoterPole(e.target.value)}
                  aria-label={tr('Mediawan pole', lang)}
                  className="h-[34px] px-3 rounded-xl bg-soft border border-line focus:border-accent focus:outline-none text-[12px] text-ink"
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
                className="w-full p-3 rounded-xl bg-soft border border-line focus:border-accent focus:outline-none text-[12.5px] text-ink resize-none"
              />

              {voteError && (
                <div className="text-[11.5px] text-danger">
                  {voteError}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
                    justVoted
                      ? 'bg-pop text-on-pop'
                      : 'bg-pop hover:bg-pop-hover text-on-pop'
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
