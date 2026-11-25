import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  PlugZap,
  Sparkles,
  X,
} from 'lucide-react';
import { ApiConnectorConfig, ApiId, AppLang, MicroTrend } from '../types';
import { PlatformBrandIcon } from './PlatformIcons';
import { calculateEmergenceScore } from '../utils/csvParser';

interface ApiManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectors: ApiConnectorConfig[];
  onToggleConnector: (id: ApiId) => void;
  onUpdateApiKey: (id: ApiId, key: string) => void;
  onInjectLiveTrends: (trends: MicroTrend[], sourceLabel: string) => void;
  lang?: AppLang;
}

export const ApiManagerModal: React.FC<ApiManagerModalProps> = ({
  isOpen,
  onClose,
  connectors,
  onToggleConnector,
  onUpdateApiKey,
  onInjectLiveTrends,
  lang = 'fr',
}) => {
  const [expandedKeyId, setExpandedKeyId] = useState<ApiId | null>(null);
  const [fetchingYoutube, setFetchingYoutube] = useState(false);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [youtubeSuccess, setYoutubeSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const isFr = lang === 'fr';
  const enabledCount = connectors.filter((c) => c.enabled).length;

  const handleFetchLiveYoutube = async (apiKey: string) => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setYoutubeError('Paste a valid YouTube Data API v3 key first.');
      return;
    }

    setFetchingYoutube(true);
    setYoutubeError(null);
    setYoutubeSuccess(null);

    try {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=FR&maxResults=3&key=${encodeURIComponent(
        trimmed
      )}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !Array.isArray(data.items)) {
        const msg =
          data?.error?.message ||
          'YouTube API returned an error. Check your API key.';
        setYoutubeError(msg);
        setFetchingYoutube(false);
        return;
      }

      const now = Date.now();
      const liveTrends: MicroTrend[] = data.items.map(
        (item: {
          id: string;
          snippet?: {
            title?: string;
            channelTitle?: string;
            publishedAt?: string;
            tags?: string[];
          };
          statistics?: {
            viewCount?: string;
            likeCount?: string;
            commentCount?: string;
          };
        }, idx: number) => {
          const title = item.snippet?.title ?? 'Live YouTube Breakout';
          const channel = item.snippet?.channelTitle ?? 'YouTube Creator';
          const viewCount = Number(item.statistics?.viewCount ?? 250000);
          const likeCount = Number(item.statistics?.likeCount ?? 12000);
          const viewsFormatted =
            viewCount >= 1_000_000
              ? `${(viewCount / 1_000_000).toFixed(1)}M`
              : `${Math.round(viewCount / 1000)}K`;
          const engPct =
            viewCount > 0
              ? `${Math.min(25, (likeCount / viewCount) * 100).toFixed(1)}%`
              : '6.4%';

          const publishedDate = item.snippet?.publishedAt
            ? new Date(item.snippet.publishedAt)
            : new Date(now - 3 * 86400_000);
          const daysSince = Math.max(
            1,
            Math.round((now - publishedDate.getTime()) / 86400_000)
          );

          const calc = calculateEmergenceScore({
            daysSinceT0: Math.min(18, Math.max(3, daysSince)),
            velocity7d: 185 - idx * 14,
            creatorCount7d: 26 - idx * 3,
            anomalyX: 12.6 - idx * 1.1,
            platformCount: 2,
          });

          const handle = `@${channel.toLowerCase().replace(/[^a-z0-9]+/g, '')}`;

          return {
            id: `yt-live-${item.id}-${idx}`,
            title: title.length > 52 ? `${title.slice(0, 50)}…` : title,
            hook: `Live YouTube FR breakout by ${channel} (${viewsFormatted} views, ${engPct} engagement).`,
            category: idx === 0 ? 'Entertainment' : idx === 1 ? 'Talents' : 'Documentary',
            market: 'FR',
            audiences: ['Gen Z 18–25'],
            daysSinceT0: Math.min(21, daysSince),
            t0Date: publishedDate.toISOString().slice(0, 10),
            emergenceScore: calc.emergenceScore,
            velocity7d: 185 - idx * 14,
            rankMovement: { type: 'new' },
            scoreBreakdown: {
              remixVelocity: calc.remixVelocity,
              crossPlatformJump: calc.crossPlatformJump,
              audienceIntent: calc.audienceIntent,
              smallAccountLift: calc.smallAccountLift,
              remixes7d: calc.remixes7d,
              saveShareRatio: calc.saveShareRatio,
              anomalyMultiplier: `${(12.6 - idx * 1.1).toFixed(1)}x`,
              platformsCrossedDays: calc.platformsCrossedDays,
            },
            maturity: daysSince <= 7 ? 'Early Spark' : 'Breakout Zone',
            certainty: 'To Confirm',
            platforms: ['YouTube', 'Google Trends'],
            hashtags: (item.snippet?.tags ?? []).slice(0, 3),
            watchlistStatus: 'Not Tracked',
            viralVideo: {
              title,
              platform: 'YouTube',
              viewsFormatted,
              engagementRate: engPct,
              uploadedAgo: `${daysSince}d ago`,
              uploadDate: publishedDate.toISOString().slice(0, 10),
              duration: '11:20',
              externalUrl: `https://www.youtube.com/watch?v=${item.id}`,
              thumbnailTheme: {
                palette: ['#15803D', '#0F172A', '#16A34A'],
                frameCode: `YT·LIVE${idx + 1}`,
                aspectLabel: '16:9 LIVE API',
                visualMotif: 'creator',
                captionOverlay: 'YOUTUBE DATA API V3 LIVE',
              },
              creator: {
                handle,
                displayName: channel,
                followers: 'Live channel',
                anomalyRatio: `${(12.6 - idx * 1.1).toFixed(1)}x breakout`,
                profileUrl: `https://www.youtube.com/watch?v=${item.id}`,
                country: 'FR',
              },
            },
            recommendation: {
              headline: `Review ${channel} for Talent & Format Potential`,
              rationale: 'Fetched live via YouTube Data API v3 trending feed (FR).',
              suggestedFormat: 'Digital-First or Unscripted Format Test',
              targetPole: 'Mediawan Talent Lab',
              targetWindow: 'Review within 7 days',
            },
            drivers: [
              `Live trending momentum: ${viewsFormatted} views in ${daysSince} day(s)`,
              `Strong viewer engagement rate (${engPct})`,
            ],
            limits: [
              'Live API snapshot — cross-platform replication still needs editorial verification',
            ],
            uncertaintyRisk: {
              level: 'Moderate',
              explanation: 'Imported live from YouTube Data API v3; check multi-creator spillover before greenlighting.',
              missingData: 'TikTok & Instagram cross-posting velocity.',
            },
            trajectory: [
              { dayLabel: 'Start', nicheIncubator: 25, socialVelocity: 20, mainstreamSearch: 8 },
              { dayLabel: 'Mid', nicheIncubator: 52, socialVelocity: 60, mainstreamSearch: 24 },
              { dayLabel: 'Now', nicheIncubator: 68, socialVelocity: 88, mainstreamSearch: 42 },
            ],
            votes: [],
            isLiveApi: true,
          };
        }
      );

      onInjectLiveTrends(liveTrends, 'YouTube Data API v3');
      setYoutubeSuccess(`Fetched ${liveTrends.length} live videos from YouTube API!`);
    } catch {
      setYoutubeError('Network error while contacting YouTube Data API v3.');
    } finally {
      setFetchingYoutube(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22201D]/35 dark:bg-black/60 backdrop-blur-[2px] animate-backdrop-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-modal-title"
        className="w-full max-w-[680px] rounded-[20px] bg-[#FFFFFF] dark:bg-[#2E2C28] border border-[#EAE4D9] dark:border-[#3E3B35] shadow-elevated overflow-hidden animate-modal-in"
      >
        <div className="px-6 py-4.5 border-b border-[#EAE4D9] dark:border-[#3E3B35] bg-[#FBF9F4] dark:bg-[#24221F] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EBF5EE] dark:bg-[#263628] border border-[#CAE5D3] dark:border-[#395439] text-[#1F6F43] dark:text-[#81B64C] flex items-center justify-center">
              <PlugZap className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="api-modal-title"
                className="font-display text-[16px] font-bold text-[#22201D] dark:text-[#F5F2EC]"
              >
                {isFr
                  ? `APIs sociales connectées (${enabledCount} / ${connectors.length} actives)`
                  : `Connected Social APIs (${enabledCount} / ${connectors.length} active)`}
              </h2>
              <p className="text-[12px] text-[#625C53] dark:text-[#B5AFA4]">
                {isFr
                  ? 'Activez les flux ou configurez vos clés API (TikTok, YouTube, Instagram, Facebook, Reddit, Google Trends).'
                  : 'Turn feeds ON/OFF or configure your API keys (TikTok, YouTube, Instagram, Facebook, Reddit, Google Trends).'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close API manager"
            className="p-1.5 rounded-full text-[#625C53] dark:text-[#B5AFA4] hover:text-[#22201D] dark:hover:text-[#F5F2EC] hover:bg-[#EAE4D9] dark:hover:bg-[#383632] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-2.5 max-h-[72vh] overflow-y-auto bg-[#FBF9F4] dark:bg-[#24221F]">
          {connectors.map((api) => {
            const isKeyOpen = expandedKeyId === api.id;
            const hasSavedKey = api.apiKey.trim().length > 0;

            return (
              <div
                key={api.id}
                className={`rounded-[14px] bg-[#FFFFFF] dark:bg-[#2E2C28] border p-3.5 transition-colors ${
                  api.enabled
                    ? 'border-[#EAE4D9] dark:border-[#3E3B35]'
                    : 'border-[#EAE4D9] dark:border-[#3E3B35] opacity-65'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#FBF9F4] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35] flex items-center justify-center shrink-0">
                      <PlatformBrandIcon platform={api.platform} size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13.5px] font-semibold text-[#22201D] dark:text-[#F5F2EC]">
                          {api.name}
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#FBF9F4] dark:bg-[#24221F] text-[#625C53] dark:text-[#B5AFA4] border border-[#EAE4D9] dark:border-[#3E3B35]">
                          {api.endpointLabel}
                        </span>
                        {hasSavedKey && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#EBF5EE] dark:bg-[#263628] text-[#1F6F43] dark:text-[#81B64C] border border-[#CAE5D3] dark:border-[#395439]">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>{isFr ? 'Clé enregistrée' : 'Key saved'}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#625C53] dark:text-[#B5AFA4] mt-0.5 truncate">
                        {api.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedKeyId(isKeyOpen ? null : api.id)
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#FBF9F4] dark:bg-[#24221F] hover:bg-[#F4F0E8] dark:hover:bg-[#383632] text-[#22201D] dark:text-[#F5F2EC] border border-[#EAE4D9] dark:border-[#3E3B35] transition-colors"
                    >
                      <KeyRound className="w-3 h-3 text-[#625C53] dark:text-[#B5AFA4]" />
                      <span>
                        {isKeyOpen
                          ? isFr
                            ? 'Masquer'
                            : 'Hide key'
                          : isFr
                          ? 'Configurer'
                          : 'Configure key'}
                      </span>
                    </button>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={api.enabled}
                      aria-label={`Toggle ${api.name}`}
                      onClick={() => onToggleConnector(api.id)}
                      className={`relative w-9 h-5 rounded-full transition-colors duration-150 ${
                        api.enabled
                          ? 'bg-[#1F6F43] dark:bg-[#81B64C]'
                          : 'bg-[#D9D1C3] dark:bg-[#4A4741]'
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-[#FFFFFF] transition-transform duration-150 ${
                          api.enabled ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {isKeyOpen && (
                  <div className="mt-3 pt-3 border-t border-[#EAE4D9] dark:border-[#3E3B35] space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="password"
                        value={api.apiKey}
                        onChange={(e) => onUpdateApiKey(api.id, e.target.value)}
                        placeholder={
                          isFr
                            ? `Collez votre clé / jeton ${api.name}…`
                            : `Paste your ${api.name} access token or key…`
                        }
                        className="flex-1 min-w-[220px] h-[34px] px-3 rounded-xl bg-[#FBF9F4] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35] focus:border-[#1F6F43] focus:outline-none text-[12px] font-mono text-[#22201D] dark:text-[#F5F2EC]"
                      />

                      {api.supportsBrowserFetch ? (
                        <button
                          type="button"
                          disabled={fetchingYoutube}
                          onClick={() => handleFetchLiveYoutube(api.apiKey)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold bg-[#1F6F43] hover:bg-[#185B36] dark:bg-[#81B64C] text-[#FFFFFF] dark:text-[#191815] disabled:opacity-50 transition-colors"
                        >
                          {fetchingYoutube ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {isFr ? 'Charger YouTube FR live' : 'Fetch live YouTube trends'}
                          </span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#625C53] dark:text-[#B5AFA4] px-2">
                          {isFr
                            ? 'Jeton enregistré localement (prêt proxy)'
                            : 'Token saved locally (proxy-ready)'}
                        </span>
                      )}
                    </div>

                    {api.supportsBrowserFetch && youtubeError && (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#991B1B] dark:text-[#F87171]">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{youtubeError}</span>
                      </div>
                    )}
                    {api.supportsBrowserFetch && youtubeSuccess && (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#1F6F43] dark:text-[#81B64C] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{youtubeSuccess}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3.5 bg-[#FFFFFF] dark:bg-[#2E2C28] border-t border-[#EAE4D9] dark:border-[#3E3B35] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-[13px] font-semibold bg-[#1F6F43] hover:bg-[#185B36] dark:bg-[#81B64C] text-[#FFFFFF] dark:text-[#191815] transition-colors"
          >
            {isFr ? 'Terminer' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
