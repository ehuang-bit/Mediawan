import type { MicroTrend } from '../src/types';
import { formatAgeLabel, formatCompactViews } from './scoringEngine';

interface LiveYoutubeEntry {
  videoId: string;
  title: string;
  published: string;
  views: number;
  thumbnailUrl: string;
  channelTitle: string;
}

const YOUTUBE_CHANNEL_BINDINGS: Record<string, string[]> = {
  'mw-sig-01': ['UCn_FAXem2-e3HQvmK-mOH4g'], // GLITCH (EN)
  'mw-sig-02': ['UCNwxZoU9bBq-UI3viJZ84FQ'], // that's a bad idea / Curry Barker (EN)
  'mw-sig-03': ['UC-vrN89jIox3XqAKbEMeFgQ'], // GOBELINS Paris (FR)
  'mw-sig-05': ['UCODHrzPMGbNv67e84WDZhQQ'], // fern (EN)
  'mw-sig-06': ['UCxH16958KSxT4Z9yL_9JYtw', 'UC2ruguOcwnVR2_4DtiGnmLg'], // EGO & TheGreatReview (FR)
  'mw-sig-07': ['UCxkM67T_Iele-mRVUiBkRqg'], // Jet Lag: The Game (EN)
  'mw-sig-10': ['UCEUZRSYr1a2hnBfnpWslFeQ'], // Djilsi (FR)
};

const WIKIMEDIA_BINDINGS: Record<string, string> = {
  'mw-sig-04': 'Dungeon_Crawler_Carl',
  'mw-sig-07': 'Jet_Lag:_The_Game',
  'mw-sig-08': 'Game_Changer_(game_show)',
  'mw-past-01': 'Skibidi_Toilet',
  'mw-past-02': 'Hazbin_Hotel',
  'mw-past-03': 'The_Amazing_Digital_Circus',
  'mw-past-04': 'Cocomelon',
  'mw-past-05': 'Oddbods',
  'mw-past-06': "Simon's_Cat",
};

function decodeXmlEntities(raw: string): string {
  return raw
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseYoutubeAtom(xml: string): LiveYoutubeEntry[] {
  const channelMatch = xml.match(/<author>\s*<name>([\s\S]*?)<\/name>/);
  const channelTitle = channelMatch ? decodeXmlEntities(channelMatch[1].trim()) : 'YouTube';
  const entryMatches = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  const parsed: LiveYoutubeEntry[] = [];

  for (const block of entryMatches.slice(0, 5)) {
    const idMatch = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/);
    const pubMatch = block.match(/<published>([^<]+)<\/published>/);
    const viewsMatch = block.match(/<media:statistics[^>]*views="(\d+)"/);
    const thumbMatch = block.match(/<media:thumbnail[^>]*url="([^"]+)"/);

    if (idMatch && titleMatch && pubMatch) {
      parsed.push({
        videoId: idMatch[1].trim(),
        title: decodeXmlEntities(titleMatch[1].trim()),
        published: pubMatch[1].trim(),
        views: viewsMatch ? Number(viewsMatch[1]) : 0,
        thumbnailUrl: thumbMatch
          ? thumbMatch[1].trim()
          : `https://i.ytimg.com/vi/${idMatch[1].trim()}/hqdefault.jpg`,
        channelTitle,
      });
    }
  }
  return parsed;
}

async function fetchYoutubeFeed(channelId: string): Promise<LiveYoutubeEntry[]> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'MediawanRadar/1.0' },
    signal: AbortSignal.timeout(6500),
  });
  if (!res.ok) throw new Error(`YT Atom ${res.status}`);
  const xml = await res.text();
  return parseYoutubeAtom(xml);
}

interface WikiStats {
  views14d: number;
  growthPct: number;
  latestViews: number;
}

async function fetchWikimedia14d(article: string): Promise<WikiStats> {
  const end = new Date();
  end.setDate(end.getDate() - 1);
  const start = new Date(end);
  start.setDate(start.getDate() - 13);

  const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');
  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/${encodeURIComponent(
    article
  )}/daily/${fmt(start)}/${fmt(end)}`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'MediawanRadar/1.0 (editorial-intelligence-sync)' },
    signal: AbortSignal.timeout(6500),
  });
  if (!res.ok) throw new Error(`Wiki REST ${res.status}`);
  const data = (await res.json()) as { items?: { views?: number }[] };
  const items = Array.isArray(data.items) ? data.items : [];
  const viewsList = items.map((i) => Number(i.views ?? 0));
  const views14d = viewsList.reduce((acc, v) => acc + v, 0);

  const half = Math.floor(viewsList.length / 2);
  const prev7 = viewsList.slice(0, half).reduce((a, b) => a + b, 0);
  const last7 = viewsList.slice(half).reduce((a, b) => a + b, 0);
  const growthPct =
    prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : 0;

  return {
    views14d,
    growthPct,
    latestViews: viewsList[viewsList.length - 1] ?? 0,
  };
}

export interface LiveSyncResult {
  trends: MicroTrend[];
  youtubeFeedsOk: number;
  wikiFeedsOk: number;
  durationMs: number;
  fetchedAt: string;
}

export async function ingestLiveFeeds(currentTrends: MicroTrend[]): Promise<LiveSyncResult> {
  const startedAt = Date.now();
  const fetchedAt = new Date().toISOString();

  // Fetch all YouTube Atom feeds & Wikimedia REST stats concurrently
  const ytEntriesMap = new Map<string, LiveYoutubeEntry[]>();
  const wikiMap = new Map<string, WikiStats>();

  const uniqueChannels = Array.from(
    new Set(Object.values(YOUTUBE_CHANNEL_BINDINGS).flat())
  );
  const uniqueWikiEntries = Object.entries(WIKIMEDIA_BINDINGS);

  const [ytResults, wikiResults] = await Promise.all([
    Promise.allSettled(
      uniqueChannels.map(async (channelId) => ({
        channelId,
        entries: await fetchYoutubeFeed(channelId),
      }))
    ),
    Promise.allSettled(
      uniqueWikiEntries.map(async ([trendId, article]) => ({
        trendId,
        stats: await fetchWikimedia14d(article),
      }))
    ),
  ]);

  let youtubeFeedsOk = 0;
  for (const r of ytResults) {
    if (r.status === 'fulfilled' && r.value.entries.length > 0) {
      youtubeFeedsOk += 1;
      ytEntriesMap.set(r.value.channelId, r.value.entries);
    }
  }

  let wikiFeedsOk = 0;
  for (const r of wikiResults) {
    if (r.status === 'fulfilled') {
      wikiFeedsOk += 1;
      wikiMap.set(r.value.trendId, r.value.stats);
    }
  }

  const updatedTrends = currentTrends.map((trend) => {
    const channelIds = YOUTUBE_CHANNEL_BINDINGS[trend.id] ?? [];
    const candidateEntries = channelIds.flatMap((cid) => ytEntriesMap.get(cid) ?? []);

    // Pick freshest high-impact upload inside recent feed entries
    let bestVideo: LiveYoutubeEntry | undefined;
    if (candidateEntries.length > 0) {
      bestVideo = [...candidateEntries].sort((a, b) => {
        const ageA = formatAgeLabel(a.published).daysAgo;
        const ageB = formatAgeLabel(b.published).daysAgo;
        // Prefer uploads <=21d old with highest view counts
        const scoreA = (ageA <= 21 ? 10_000_000 : 0) + a.views;
        const scoreB = (ageB <= 21 ? 10_000_000 : 0) + b.views;
        return scoreB - scoreA;
      })[0];
    }

    const wiki = wikiMap.get(trend.id);
    if (!bestVideo && !wiki) {
      return trend;
    }

    const nextTrend: MicroTrend = {
      ...trend,
      viralVideo: { ...trend.viralVideo },
      trajectory: trend.trajectory.map((pt) => ({ ...pt })),
      liveMeta: {
        source:
          bestVideo && wiki
            ? 'YouTube Atom + Wikimedia REST'
            : bestVideo
            ? 'YouTube Live Atom'
            : 'Wikimedia Pageviews REST',
        fetchedAt,
        ...(bestVideo
          ? {
              realViews: bestVideo.views,
              realPublishedDate: bestVideo.published.slice(0, 10),
            }
          : {}),
        ...(wiki ? { wikiViews14d: wiki.views14d } : {}),
      },
    };

    if (bestVideo) {
      const age = formatAgeLabel(bestVideo.published);
      const isShort =
        bestVideo.title.includes('#') ||
        bestVideo.title.toLowerCase().includes('incoming') ||
        bestVideo.title.toLowerCase().includes('memories');
      // Always capture real thumbnail & view telemetry cleanly; only replace flagship title/URL
      // when the latest feed entry is a genuine non-short flagship upload within 21 days.
      nextTrend.viralVideo.thumbnailUrl = bestVideo.thumbnailUrl;
      if (!isShort && age.daysAgo >= 1 && age.daysAgo <= 21 && bestVideo.views >= 1_500_000) {
        nextTrend.viralVideo.title = bestVideo.title;
        nextTrend.viralVideo.viewsFormatted = formatCompactViews(bestVideo.views);
        nextTrend.viralVideo.uploadedAgo = age.uploadedAgo;
        nextTrend.viralVideo.uploadDate = age.uploadDateFormatted;
        nextTrend.viralVideo.externalUrl = `https://www.youtube.com/watch?v=${bestVideo.videoId}`;
        if (!nextTrend.isPastTrend) {
          nextTrend.daysSinceT0 = age.daysAgo;
          nextTrend.t0Date = bestVideo.published.slice(0, 10);
        }
      }
    }

    if (wiki && !nextTrend.isPastTrend && nextTrend.trajectory.length > 0) {
      const lastIdx = nextTrend.trajectory.length - 1;
      const wikiScaled = Math.min(95, Math.max(25, Math.round(Math.log10(Math.max(100, wiki.views14d)) * 16)));
      nextTrend.trajectory[lastIdx] = {
        ...nextTrend.trajectory[lastIdx],
        mainstreamSearch: wikiScaled,
      };
    }

    return nextTrend;
  });

  return {
    trends: updatedTrends,
    youtubeFeedsOk,
    wikiFeedsOk,
    durationMs: Date.now() - startedAt,
    fetchedAt,
  };
}
