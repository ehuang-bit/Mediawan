import type { MediawanCategory, MicroTrend, TrendMarket } from '../types';
import { calculateEmergenceScore, type CsvParseResult } from './csvParser';

/**
 * Reads a CSV exported from trends.google.com ("Interest over time" → download)
 * and turns each keyword column into a radar signal.
 *
 * Google Trends alone is ONE source: the signal stays "to confirm" until another
 * source (YouTube, Wikipedia…) backs it up. That is intentional.
 */

const TIME_HEADER = /^(week|day|month|time|date|semaine|jour|mois|heure|temps)$/i;

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function findHeaderIndex(lines: string[]): number {
  return lines.findIndex((l) => {
    const cells = splitCsvLine(l);
    return cells.length >= 2 && TIME_HEADER.test(cells[0].replace(/^﻿/, ''));
  });
}

export function isGoogleTrendsCsv(text: string): boolean {
  const lines = text.replace(/\r/g, '').split('\n').filter((l) => l.trim());
  const idx = findHeaderIndex(lines.slice(0, 6));
  return idx !== -1;
}

function parseValue(raw: string): number {
  if (raw.startsWith('<')) return 0.5;
  const n = Number(raw.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function guessCategory(keyword: string): MediawanCategory {
  const k = keyword.toLowerCase();
  if (/anime|animation|cartoon|dessin anim/.test(k)) return 'Animation';
  if (/doc|documentar|true crime/.test(k)) return 'Documentary';
  if (/book|novel|roman|manga|webtoon|wattpad|série|series|film|movie|saga/.test(k)) return 'Fiction';
  if (k.startsWith('@')) return 'Talents';
  return 'Entertainment';
}

function guessMarket(geo: string): TrendMarket {
  if (/france|fr\b/i.test(geo)) return 'FR';
  if (/united|states|kingdom|worldwide|monde|world|us\b|uk\b/i.test(geo)) return 'EN';
  return 'FR / EN';
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export function parseGoogleTrendsCsv(text: string): CsvParseResult {
  const errors: string[] = [];
  const lines = text.replace(/\r/g, '').split('\n').filter((l) => l.trim());
  const headerIdx = findHeaderIndex(lines);
  if (headerIdx === -1) {
    return { trends: [], errors: ['Google Trends: header row (Week/Day/Time, keyword…) not found.'] };
  }

  const header = splitCsvLine(lines[headerIdx]);
  const rows = lines
    .slice(headerIdx + 1)
    .map(splitCsvLine)
    .filter((r) => r.length === header.length && !Number.isNaN(new Date(r[0]).getTime()));

  if (rows.length < 4) {
    return { trends: [], errors: ['Google Trends: not enough data points (need at least 4).'] };
  }

  const dates = rows.map((r) => new Date(r[0]));
  const lastDate = dates[dates.length - 1];
  const stepDays = Math.max(1, Math.round((dates[1].getTime() - dates[0].getTime()) / 86400000));
  const trends: MicroTrend[] = [];

  for (let col = 1; col < header.length; col++) {
    const rawName = header[col];
    const keyword = rawName.replace(/:\s*\(.*\)\s*$/, '').trim() || rawName;
    const geo = (rawName.match(/\(([^)]*)\)\s*$/) ?? [])[1] ?? '';
    const series = rows.map((r) => parseValue(r[col]));
    const max = Math.max(...series, 1);

    // Recent window vs the window just before it (each = 1/4 of the period, min 2 points)
    const w = Math.max(2, Math.floor(series.length / 4));
    const recent = mean(series.slice(-w));
    const previous = mean(series.slice(-2 * w, -w));
    const growthPct = Math.round(((recent - previous) / Math.max(previous, 1)) * 100);

    // Baseline = median of the first half; t0 = start of the current sustained rise
    const firstHalf = [...series.slice(0, Math.floor(series.length / 2))].sort((a, b) => a - b);
    const baseline = Math.max(1, firstHalf[Math.floor(firstHalf.length / 2)] ?? 1);
    let t0Index = series.length - 1;
    while (t0Index > 0 && series[t0Index - 1] >= baseline * 1.5) t0Index--;
    const daysSinceT0 = Math.max(
      1,
      Math.round((lastDate.getTime() - dates[t0Index].getTime()) / 86400000) + stepDays
    );
    const anomalyX = Math.round((recent / baseline) * 10) / 10;

    const calc = calculateEmergenceScore({
      daysSinceT0,
      velocity7d: Math.max(0, growthPct),
      creatorCount7d: 0, // Google Trends says nothing about creators
      anomalyX,
      platformCount: 1,
    });
    const isPastTrend = daysSinceT0 > 21;
    const category = guessCategory(keyword);

    // 4–6 evenly spaced points for the trajectory chart
    const nPts = Math.min(6, series.length);
    const trajectory = Array.from({ length: nPts }, (_, i) => {
      const idx = Math.round((i * (series.length - 1)) / (nPts - 1));
      return {
        dayLabel: dates[idx].toISOString().slice(5, 10),
        nicheIncubator: 0,
        socialVelocity: 0,
        mainstreamSearch: Math.round((series[idx] / max) * 100),
      };
    });

    trends.push({
      id: `gtrends-${Date.now()}-${col}`,
      title: keyword,
      hook: `Google Trends${geo ? ` (${geo})` : ''}: search interest ${growthPct >= 0 ? '+' : ''}${growthPct}% vs the previous period, ${anomalyX}x its usual level.`,
      category,
      market: guessMarket(geo),
      audiences: ['Gen Z 18–25'],
      daysSinceT0,
      t0Date: dates[t0Index].toISOString().slice(0, 10),
      emergenceScore: calc.emergenceScore,
      velocity7d: growthPct,
      rankMovement: { type: 'new' },
      scoreBreakdown: {
        remixVelocity: calc.remixVelocity,
        crossPlatformJump: calc.crossPlatformJump,
        audienceIntent: calc.audienceIntent,
        smallAccountLift: calc.smallAccountLift,
        remixes7d: 0,
        saveShareRatio: 'n/a',
        anomalyMultiplier: `${anomalyX}x`,
        platformsCrossedDays: `1 source in ${Math.min(21, daysSinceT0)}d`,
      },
      maturity: calc.maturity,
      certainty: 'High Uncertainty',
      platforms: ['Google Trends'],
      hashtags: [],
      watchlistStatus: 'Not Tracked',
      isPastTrend,
      ...(isPastTrend
        ? {
            pastEraMetadata: {
              eraLabel: `Since ${dates[t0Index].toISOString().slice(0, 7)}`,
              peakScale: `Peak index ${Math.round(max)}/100`,
              lifespanLabel: `Elevated for ${daysSinceT0} days`,
              whyItFaded: 'Already elevated for more than 21 days: outside the early-detection window.',
              archetype: 'Multi-Year Saga' as const,
            },
          }
        : {}),
      viralVideo: {
        title: `Google Trends: ${keyword}`,
        platform: 'Google Trends',
        viewsFormatted: `${Math.round(recent)}/100`,
        engagementRate: 'n/a',
        uploadedAgo: 'Today',
        uploadDate: lastDate.toISOString().slice(0, 10),
        duration: '—',
        externalUrl: `https://trends.google.com/trends/explore?q=${encodeURIComponent(keyword)}`,
        thumbnailTheme: {
          palette: ['#1E3A8A', '#2563EB', '#16A34A'],
          frameCode: 'GT·CSV',
          aspectLabel: 'SEARCH INDEX',
          visualMotif: 'archive',
          captionOverlay: 'GOOGLE TRENDS SNAPSHOT',
        },
        creator: {
          handle: '@google.trends',
          displayName: 'Google Trends',
          followers: '—',
          anomalyRatio: `${anomalyX}x vs baseline`,
          profileUrl: `https://trends.google.com/trends/explore?q=${encodeURIComponent(keyword)}`,
          country: geo || 'Worldwide',
        },
      },
      recommendation: {
        headline: `Cross-check “${keyword}” on YouTube and Wikipedia before any decision`,
        rationale: 'Search interest alone does not prove a trend: it needs a second, independent source.',
        suggestedFormat: 'Editorial check',
        targetPole: `Mediawan ${category} desk`,
        targetWindow: isPastTrend ? 'Archived (>21d horizon)' : 'Re-check in 7 days',
      },
      drivers: [
        `Search interest ${growthPct >= 0 ? '+' : ''}${growthPct}% vs the previous period`,
        `${anomalyX}x its usual level`,
      ],
      limits: [
        'Single source (Google Trends): relative index, not a volume',
        'No information on creators or engagement',
      ],
      uncertaintyRisk: {
        level: 'High Uncertainty',
        explanation: 'Only one source so far. The radar waits for YouTube or Wikipedia to confirm.',
        missingData: 'Creator replication and engagement on social platforms',
      },
      trajectory,
      votes: [],
      isImported: true,
    });
  }

  if (trends.length === 0) errors.push('Google Trends: no keyword column found.');
  return { trends, errors };
}
