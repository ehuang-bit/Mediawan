import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import type { MicroTrend, TeamVote, WatchlistStatus } from '../src/types';
import {
  DB_FILE_PATH,
  extractMeta,
  readDatabase,
  resetDatabase,
  writeDatabase,
} from './store';
import { ingestLiveFeeds } from './liveIngest';
import { computeBreakoutScore, formatCompactViews } from './scoringEngine';

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf-8').trim();
        resolve(raw ? (JSON.parse(raw) as Record<string, unknown>) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function attachMediawanApi(middlewares: {
  use: (
    handler: (
      req: IncomingMessage,
      res: ServerResponse,
      next: () => void
    ) => void
  ) => void;
}) {
  middlewares.use(async (req, res, next) => {
    const rawUrl = req.url ?? '';
    if (!rawUrl.startsWith('/api/')) {
      next();
      return;
    }

    const pathname = rawUrl.split('?')[0];
    const method = (req.method ?? 'GET').toUpperCase();

    try {
      // GET /api/health
      if (method === 'GET' && pathname === '/api/health') {
        const db = readDatabase();
        const activeSignals = db.trends.filter((t) => !t.isPastTrend).length;
        const pastTrends = db.trends.filter((t) => t.isPastTrend).length;
        sendJson(res, 200, {
          ok: true,
          engine: 'Mediawan Radar Node API v6',
          dbFile: DB_FILE_PATH,
          totalSignals: db.trends.length,
          activeSignals,
          pastTrends,
          ...extractMeta(db),
        });
        return;
      }

      // GET /api/signals
      if (method === 'GET' && pathname === '/api/signals') {
        const db = readDatabase();
        sendJson(res, 200, {
          trends: db.trends,
          meta: extractMeta(db),
        });
        return;
      }

      // POST /api/sync — fetch live YouTube Atom RSS + Wikimedia Pageviews & persist
      if (method === 'POST' && pathname === '/api/sync') {
        const db = readDatabase();
        const syncRes = await ingestLiveFeeds(db.trends);
        db.trends = syncRes.trends;
        db.lastSyncAt = syncRes.fetchedAt;
        db.syncStats = {
          youtubeFeedsOk: syncRes.youtubeFeedsOk,
          wikiFeedsOk: syncRes.wikiFeedsOk,
          durationMs: syncRes.durationMs,
        };
        writeDatabase(db);
        sendJson(res, 200, {
          trends: db.trends,
          meta: extractMeta(db),
        });
        return;
      }

      // POST /api/reset
      if (method === 'POST' && pathname === '/api/reset') {
        const fresh = resetDatabase();
        sendJson(res, 200, {
          trends: fresh.trends,
          meta: extractMeta(fresh),
        });
        return;
      }

      // POST /api/signals/import
      if (method === 'POST' && pathname === '/api/signals/import') {
        const body = await readJsonBody(req);
        const incoming = Array.isArray(body.trends)
          ? (body.trends as MicroTrend[])
          : [];
        if (incoming.length === 0) {
          sendJson(res, 400, { error: 'No valid trends provided in payload.' });
          return;
        }
        const db = readDatabase();
        const existingIds = new Set(db.trends.map((t) => t.id));
        const unique = incoming.filter((t) => t && t.id && !existingIds.has(t.id));
        db.trends = [...unique, ...db.trends];
        writeDatabase(db);
        sendJson(res, 200, {
          addedCount: unique.length,
          trends: db.trends,
          meta: extractMeta(db),
        });
        return;
      }

      // POST /api/signals/:id/votes
      const voteMatch = pathname.match(/^\/api\/signals\/([^/]+)\/votes$/);
      if (method === 'POST' && voteMatch) {
        const trendId = decodeURIComponent(voteMatch[1]);
        const body = await readJsonBody(req);
        const colleagueName = String(body.colleagueName ?? '').trim();
        const initials = String(body.initials ?? 'MW').trim().slice(0, 3);
        const pole = String(body.pole ?? 'Acquisitions · Group').trim();
        const rationale = String(body.rationale ?? '').trim();

        if (!colleagueName || rationale.length < 4) {
          sendJson(res, 400, {
            error: 'colleagueName and rationale (min 4 chars) are required.',
          });
          return;
        }

        const db = readDatabase();
        const idx = db.trends.findIndex((t) => t.id === trendId);
        if (idx === -1) {
          sendJson(res, 404, { error: `Signal "${trendId}" not found.` });
          return;
        }

        const newVote: TeamVote = {
          id: `vote-${Date.now()}`,
          colleagueName,
          initials,
          pole,
          timestamp: 'Just now',
          rationale,
        };
        db.trends[idx] = {
          ...db.trends[idx],
          votes: [newVote, ...db.trends[idx].votes],
        };
        writeDatabase(db);
        sendJson(res, 200, {
          vote: newVote,
          trend: db.trends[idx],
        });
        return;
      }

      // PATCH /api/signals/:id/watchlist
      const watchlistMatch = pathname.match(/^\/api\/signals\/([^/]+)\/watchlist$/);
      if (method === 'PATCH' && watchlistMatch) {
        const trendId = decodeURIComponent(watchlistMatch[1]);
        const body = await readJsonBody(req);
        const status = String(body.status ?? '') as WatchlistStatus;
        const allowed: WatchlistStatus[] = [
          'Not Tracked',
          'Monitoring',
          'Under Review',
          'Outreach Started',
        ];
        if (!allowed.includes(status)) {
          sendJson(res, 400, { error: 'Invalid watchlist status.' });
          return;
        }

        const db = readDatabase();
        const idx = db.trends.findIndex((t) => t.id === trendId);
        if (idx === -1) {
          sendJson(res, 404, { error: `Signal "${trendId}" not found.` });
          return;
        }

        db.trends[idx] = {
          ...db.trends[idx],
          watchlistStatus: status,
        };
        writeDatabase(db);
        sendJson(res, 200, { trend: db.trends[idx] });
        return;
      }

      // POST /api/connectors/youtube-live
      if (method === 'POST' && pathname === '/api/connectors/youtube-live') {
        const body = await readJsonBody(req);
        const apiKey = String(body.apiKey ?? '').trim();
        if (!apiKey) {
          sendJson(res, 400, { error: 'Missing YouTube Data API v3 key.' });
          return;
        }

        const ytUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=FR&maxResults=3&key=${encodeURIComponent(
          apiKey
        )}`;
        const ytRes = await fetch(ytUrl, { signal: AbortSignal.timeout(8000) });
        const ytData = (await ytRes.json()) as {
          error?: { message?: string };
          items?: {
            id: string;
            snippet?: {
              title?: string;
              channelTitle?: string;
              publishedAt?: string;
              tags?: string[];
              thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
            };
            statistics?: {
              viewCount?: string;
              likeCount?: string;
            };
          }[];
        };

        if (!ytRes.ok || !Array.isArray(ytData.items)) {
          sendJson(res, ytRes.status || 502, {
            error: ytData.error?.message || 'YouTube Data API v3 rejected request.',
          });
          return;
        }

        const nowMs = Date.now();
        const addedTrends: MicroTrend[] = ytData.items.map((item, idx) => {
          const title = item.snippet?.title ?? 'Live YouTube Breakout';
          const channel = item.snippet?.channelTitle ?? 'YouTube Creator';
          const viewCount = Number(item.statistics?.viewCount ?? 250000);
          const likeCount = Number(item.statistics?.likeCount ?? 12000);
          const viewsFormatted = formatCompactViews(viewCount);
          const engPct =
            viewCount > 0
              ? `${Math.min(25, (likeCount / viewCount) * 100).toFixed(1)}%`
              : '6.4%';

          const publishedDate = item.snippet?.publishedAt
            ? new Date(item.snippet.publishedAt)
            : new Date(nowMs - 3 * 86_400_000);
          const daysSince = Math.max(
            1,
            Math.min(21, Math.round((nowMs - publishedDate.getTime()) / 86_400_000))
          );

          const calc = computeBreakoutScore({
            daysSinceT0: daysSince,
            velocity7d: 185 - idx * 14,
            creatorCount7d: 26 - idx * 3,
            anomalyX: 12.6 - idx * 1.1,
            platformCount: 2,
          });

          const handle = `@${channel.toLowerCase().replace(/[^a-z0-9]+/g, '')}`;
          const thumbUrl =
            item.snippet?.thumbnails?.high?.url ||
            item.snippet?.thumbnails?.medium?.url ||
            `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;

          return {
            id: `yt-live-${item.id}-${idx}`,
            title: title.length > 52 ? `${title.slice(0, 50)}…` : title,
            hook: `Live YouTube FR breakout by ${channel} (${viewsFormatted} views, ${engPct} engagement).`,
            category: idx === 0 ? 'Entertainment' : idx === 1 ? 'Talents' : 'Documentary',
            market: 'FR',
            audiences: ['Gen Z 18–25'],
            daysSinceT0: daysSince,
            t0Date: publishedDate.toISOString().slice(0, 10),
            emergenceScore: calc.emergenceScore,
            velocity7d: 185 - idx * 14,
            rankMovement: { type: 'new' },
            scoreBreakdown: calc.scoreBreakdown,
            maturity: calc.maturity,
            certainty: 'To Confirm',
            platforms: ['YouTube', 'Google Trends'],
            hashtags: (item.snippet?.tags ?? []).slice(0, 3),
            watchlistStatus: 'Not Tracked',
            liveMeta: {
              source: 'YouTube Data API v3 Live',
              fetchedAt: new Date().toISOString(),
              realViews: viewCount,
              realPublishedDate: publishedDate.toISOString().slice(0, 10),
            },
            viralVideo: {
              title,
              platform: 'YouTube',
              viewsFormatted,
              engagementRate: engPct,
              uploadedAgo: `${daysSince}d ago`,
              uploadDate: publishedDate.toISOString().slice(0, 10),
              duration: '11:20',
              externalUrl: `https://www.youtube.com/watch?v=${item.id}`,
              thumbnailUrl: thumbUrl,
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
              { dayLabel: 'Day 1', nicheIncubator: 25, socialVelocity: 20, mainstreamSearch: 8 },
              { dayLabel: 'Mid', nicheIncubator: 52, socialVelocity: 60, mainstreamSearch: 24 },
              { dayLabel: `Now (${daysSince}d)`, nicheIncubator: 68, socialVelocity: 88, mainstreamSearch: 42 },
            ],
            votes: [],
            isLiveApi: true,
          };
        });

        const db = readDatabase();
        const existingIds = new Set(db.trends.map((t) => t.id));
        const unique = addedTrends.filter((lt) => !existingIds.has(lt.id));
        db.trends = [...unique, ...db.trends];
        writeDatabase(db);

        sendJson(res, 200, {
          addedTrends,
          trends: db.trends,
          meta: extractMeta(db),
        });
        return;
      }

      sendJson(res, 404, { error: `Unknown API route: ${method} ${pathname}` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Internal server error';
      sendJson(res, 500, { error: msg });
    }
  });
}

export function mediawanApiPlugin(): Plugin {
  return {
    name: 'mediawan-radar-api',
    configureServer(server) {
      attachMediawanApi(server.middlewares);
    },
    configurePreviewServer(server) {
      attachMediawanApi(server.middlewares);
    },
  };
}
