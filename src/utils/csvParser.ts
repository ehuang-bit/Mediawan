import {
  CertaintyLevel,
  MaturityStage,
  MediawanCategory,
  MicroTrend,
  PersonaCohort,
  PlatformSource,
} from '../types';

export const SAMPLE_CSV_TEMPLATE = `title,hook,category,primary_platform,secondary_platforms,audience,days_since_t0,velocity_7d_pct,creator_count_7d,view_sub_anomaly_x,creator_handle,creator_followers,viral_video_title,viral_views,viral_url,hashtags,drivers,limits,editorial_action
"Alpine Noir Mountain Rescue Logs","volunteer high-altitude rescue bodycam narratives inspiring claustrophobic European thriller concepts","Fiction","YouTube","Facebook|Reddit|Google Trends","Gen Z 18–25",14,196,38,14.4,"@chamonix.secours.archive","41.2K","Night Crevasse Extraction at 3,400m — Uncut Radio Audio","1.4M","https://www.youtube.com/results?search_query=chamonix+mountain+rescue+night","alpinenoir|secoursmontagne","High completion rates (74% avg watch duration) on 18-minute uncut rescue logs|Strong Franco-Italian cross-border setting ideal for European co-production","Heavy physical production cost at altitude|Requires careful adaptation to avoid sensationalizing real emergencies","Develop 6x52' Franco-Italian survival procedural concept with Chapter 2"
"Stop-Motion Paper Automaton Fables","tactile cardboard kinetic sculptures telling 90-second wordless dark fairy tales","Animation","Instagram","TikTok|YouTube","Kids 9–14|High School 15–18",17,215,44,16.8,"@atelier.automata","63.0K","The Clockmaker's Tin Sparrow (Built from 400 Cereal Boxes)","2.9M","https://www.youtube.com/results?search_query=cardboard+automata+animation","","Wordless visual storytelling travels across territories with zero dubbing friction|16.8x small-account algorithmic lift signals non-follower For You push","Handmade fabrication pipeline is slow to scale to 26x11' series|Single lead creator currently working solo without studio pipeline","Invite creator for R&D visual bible residency with Mediawan Kids & Family"
"Tiny Microphone Metro Confessions","hyper-fast commuter etiquette debates filmed on Paris & Milan platforms","Entertainment","TikTok","Instagram","","Gen Z 18–25",4,340,42,9.2,"@ligne13.micro","18.5K","Asking Line 13 Commuters What Secret They Kept From HR Today","1.8M","https://www.youtube.com/results?search_query=paris+metro+street+interview","microtrottoir|ligne13","Low-cost repeatable street format with high remix & share velocity|Strong local relatability in European capitals","Zero search spillover outside TikTok For You feed|Format easily copied with zero IP defensibility","Hold outreach — monitor Days 7–14 to verify if host charisma sustains retention"`;

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

const VALID_CATEGORIES: MediawanCategory[] = [
  'Fiction',
  'Animation',
  'Documentary',
  'Entertainment',
  'Talents',
];

const VALID_PLATFORMS: PlatformSource[] = [
  'TikTok',
  'YouTube',
  'Instagram',
  'Facebook',
  'Reddit',
  'Google Trends',
  'Wattpad/Webtoon',
  'Roblox/Twitch',
];

const VALID_AUDIENCES: PersonaCohort[] = [
  'Kids 9–14',
  'High School 15–18',
  'Gen Z 18–25',
];

function normalizeCategory(raw: string): MediawanCategory {
  const match = VALID_CATEGORIES.find(
    (c) => c.toLowerCase() === raw.trim().toLowerCase()
  );
  return match ?? 'Fiction';
}

function normalizePlatform(raw: string): PlatformSource {
  const cleaned = raw.trim().toLowerCase();
  for (const p of VALID_PLATFORMS) {
    if (p.toLowerCase() === cleaned || p.toLowerCase().includes(cleaned)) {
      return p;
    }
  }
  return 'YouTube';
}

function normalizeAudiences(raw: string): PersonaCohort[] {
  if (!raw.trim()) return ['Gen Z 18–25'];
  const parts = raw.split('|').map((s) => s.trim());
  const matched: PersonaCohort[] = [];
  for (const part of parts) {
    const found = VALID_AUDIENCES.find((a) =>
      a.toLowerCase().includes(part.toLowerCase().slice(0, 5))
    );
    if (found && !matched.includes(found)) matched.push(found);
  }
  return matched.length > 0 ? matched : ['Gen Z 18–25'];
}

/**
 * 21-Day Max Window Social Breakout Scoring Model (100 points total):
 * - Audio/Format Remix Rate (/30)
 * - Cross-Platform Spillover (/25)
 * - Saves, Shares & Lore Depth (/25)
 * - Small-Account Algorithmic Lift (/20)
 */
export function calculateEmergenceScore(params: {
  daysSinceT0: number;
  velocity7d: number;
  creatorCount7d: number;
  anomalyX: number;
  platformCount: number;
}): {
  emergenceScore: number;
  remixVelocity: number;
  crossPlatformJump: number;
  audienceIntent: number;
  smallAccountLift: number;
  remixes7d: number;
  saveShareRatio: string;
  platformsCrossedDays: string;
  maturity: MaturityStage;
  certainty: CertaintyLevel;
} {
  const { daysSinceT0, velocity7d, creatorCount7d, anomalyX, platformCount } =
    params;

  const isPastEra = daysSinceT0 > 21;
  const horizonPenalty = isPastEra ? 0.55 : daysSinceT0 < 7 ? 0.85 : 1.0;

  // 1. Audio & Format Remix Rate (max 30)
  const rawRemix = Math.round(
    (Math.min(300, velocity7d) / 240) * 18 * horizonPenalty +
      Math.min(12, Math.log2(Math.max(2, creatorCount7d + 1)) * 2.2)
  );
  const remixVelocity = Math.max(8, Math.min(30, rawRemix));

  // 2. Cross-Platform Spillover within <=21d (max 25)
  const rawCross = Math.round((Math.min(5, platformCount) * 4.6 + (daysSinceT0 <= 21 ? 3 : 0)) * horizonPenalty);
  const crossPlatformJump = Math.max(6, Math.min(25, rawCross));

  // 3. Saves, Shares & Lore Depth (max 25)
  const rawIntent = Math.round(
    (Math.min(20, anomalyX) / 18) * 14 * horizonPenalty +
      Math.min(11, platformCount * 2.2)
  );
  const audienceIntent = Math.max(6, Math.min(25, rawIntent));

  // 4. Small-Account Algorithmic Lift (<50K) (max 20)
  const rawLift = Math.round((Math.min(20, anomalyX) / 18) * 19 * horizonPenalty);
  const smallAccountLift = Math.max(5, Math.min(20, rawLift));

  const emergenceScore = Math.min(
    98,
    Math.max(30, remixVelocity + crossPlatformJump + audienceIntent + smallAccountLift)
  );

  const maturity: MaturityStage =
    daysSinceT0 <= 7
      ? 'Early Spark'
      : daysSinceT0 <= 21
      ? 'Breakout Zone'
      : 'Past Era';

  const certainty: CertaintyLevel =
    daysSinceT0 < 7 || platformCount <= 1
      ? 'High Uncertainty'
      : platformCount >= 3 && creatorCount7d >= 20
      ? 'High Confidence'
      : 'To Confirm';

  const remixes7d = Math.max(12, Math.round(creatorCount7d * 4.5));
  const saveShareRatio = `${Math.min(26, Math.max(4, anomalyX * 1.15)).toFixed(1)}%`;
  const platformsCrossedDays = `${platformCount} app${platformCount > 1 ? 's' : ''} in ${Math.min(21, daysSinceT0)}d`;

  return {
    emergenceScore,
    remixVelocity,
    crossPlatformJump,
    audienceIntent,
    smallAccountLift,
    remixes7d,
    saveShareRatio,
    platformsCrossedDays,
    maturity,
    certainty,
  };
}

export interface CsvParseResult {
  trends: MicroTrend[];
  errors: string[];
}

export function parseSignalsCsv(csvText: string): CsvParseResult {
  const lines = csvText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    return {
      trends: [],
      errors: ['CSV file must contain a header row and at least one signal row.'],
    };
  }

  const headers = parseCsvLine(lines[0]).map((h) =>
    h.toLowerCase().replace(/\s+/g, '_')
  );

  const idx = (name: string) => headers.indexOf(name);
  if (idx('title') === -1) {
    return {
      trends: [],
      errors: ['Missing required "title" column in CSV header.'],
    };
  }

  const imported: MicroTrend[] = [];
  const errors: string[] = [];

  for (let rowIdx = 1; rowIdx < lines.length; rowIdx++) {
    const cols = parseCsvLine(lines[rowIdx]);
    const get = (colName: string, fallback = '') => {
      const i = idx(colName);
      return i >= 0 && cols[i] !== undefined ? cols[i] : fallback;
    };

    const title = get('title');
    if (!title) {
      errors.push(`Row ${rowIdx + 1}: Skipped empty title.`);
      continue;
    }

    const category = normalizeCategory(get('category', 'Fiction'));
    const primaryPlatform = normalizePlatform(get('primary_platform', 'YouTube'));
    const secondaryRaw = get('secondary_platforms', '');
    const secondaryPlatforms = secondaryRaw
      ? secondaryRaw
          .split('|')
          .map((s) => s.trim())
          .filter(Boolean)
          .map(normalizePlatform)
      : [];

    const platforms = Array.from(
      new Set<PlatformSource>([primaryPlatform, ...secondaryPlatforms])
    );

    const daysSinceT0 = Math.max(
      1,
      parseInt(get('days_since_t0', '14'), 10) || 14
    );
    const velocity7d = Math.max(
      5,
      parseInt(get('velocity_7d_pct', '165'), 10) || 165
    );
    const creatorCount7d = Math.max(
      1,
      parseInt(get('creator_count_7d', '24'), 10) || 24
    );
    const anomalyX = Math.max(
      1.2,
      parseFloat(get('view_sub_anomaly_x', '11.5')) || 11.5
    );

    const calc = calculateEmergenceScore({
      daysSinceT0,
      velocity7d,
      creatorCount7d,
      anomalyX,
      platformCount: platforms.length,
    });

    const isPastTrend = calc.maturity === 'Past Era';

    const t0DateObj = new Date('2026-11-25T12:00:00Z');
    t0DateObj.setDate(t0DateObj.getDate() - daysSinceT0);
    const t0Date = t0DateObj.toISOString().slice(0, 10);

    const hashtagsRaw = get('hashtags', '');
    const hashtags = hashtagsRaw
      ? hashtagsRaw
          .split('|')
          .map((h) => h.replace(/^#/, '').trim())
          .filter(Boolean)
      : [];

    const driversRaw = get('drivers', '');
    const drivers = driversRaw
      ? driversRaw.split('|').map((s) => s.trim()).filter(Boolean)
      : [
          `${anomalyX.toFixed(1)}x small-account lift across ${calc.remixes7d} creator remixes`,
          `Sustained +${velocity7d}% 7-day social velocity inside ${Math.min(21, daysSinceT0)}-day window`,
        ];

    const limitsRaw = get('limits', '');
    const limits = limitsRaw
      ? limitsRaw.split('|').map((s) => s.trim()).filter(Boolean)
      : [
          'Imported batch signal — pending manual rights & territory clearance check',
          'Requires editorial screening of long-form narrative sustainability',
        ];

    const hasSearchConfirmation = platforms.includes('Google Trends');
    const uncertaintyLevel =
      calc.certainty === 'High Confidence'
        ? 'Low'
        : calc.certainty === 'To Confirm'
        ? 'Moderate'
        : 'High Uncertainty';

    const trajectory = [
      {
        dayLabel: 'Day 1',
        nicheIncubator: 24,
        socialVelocity: 16,
        mainstreamSearch: 4,
      },
      {
        dayLabel: `Day ${Math.max(2, Math.round(daysSinceT0 * 0.35))}`,
        nicheIncubator: 48,
        socialVelocity: 38,
        mainstreamSearch: hasSearchConfirmation ? 16 : 6,
      },
      {
        dayLabel: `Day ${Math.max(3, Math.round(daysSinceT0 * 0.7))}`,
        nicheIncubator: 68,
        socialVelocity: 66,
        mainstreamSearch: hasSearchConfirmation ? 34 : 9,
      },
      {
        dayLabel: `Now (${daysSinceT0}d)`,
        nicheIncubator: 78,
        socialVelocity: Math.min(98, Math.round(calc.emergenceScore * 1.02)),
        mainstreamSearch: hasSearchConfirmation ? 58 : 13,
      },
    ];

    const creatorHandle = get('creator_handle', '@imported.creator');
    const hook =
      get('hook') ||
      `Imported editorial signal detected on ${platforms.join(', ')} with +${velocity7d}% 7-day velocity.`;

    imported.push({
      id: `imported-${Date.now()}-${rowIdx}`,
      title,
      hook: hook.charAt(0).toUpperCase() + hook.slice(1),
      category,
      market: 'FR / EN',
      audiences: normalizeAudiences(get('audience', 'Gen Z 18–25')),
      daysSinceT0,
      t0Date,
      emergenceScore: calc.emergenceScore,
      velocity7d,
      rankMovement: { type: 'new' },
      scoreBreakdown: {
        remixVelocity: calc.remixVelocity,
        crossPlatformJump: calc.crossPlatformJump,
        audienceIntent: calc.audienceIntent,
        smallAccountLift: calc.smallAccountLift,
        remixes7d: calc.remixes7d,
        saveShareRatio: calc.saveShareRatio,
        anomalyMultiplier: `${anomalyX.toFixed(1)}x`,
        platformsCrossedDays: calc.platformsCrossedDays,
      },
      maturity: calc.maturity,
      certainty: calc.certainty,
      platforms,
      hashtags,
      watchlistStatus: 'Not Tracked',
      isPastTrend,
      ...(isPastTrend
        ? {
            pastEraMetadata: {
              eraLabel: `Legacy (${daysSinceT0}d old)`,
              peakScale: 'Imported historical benchmark',
              lifespanLabel: 'Exceeded 21-day early horizon',
              whyItFaded: 'Signals older than 21 days move automatically to the Past Trends archive.',
              archetype: 'Viral Flash Wave' as const,
            },
          }
        : {}),
      viralVideo: {
        title: get('viral_video_title', `${title} — Lead Signal Capture`),
        platform: primaryPlatform,
        viewsFormatted: get('viral_views', '940K'),
        engagementRate: '8.9%',
        uploadedAgo: `${Math.min(daysSinceT0, 5)} days ago`,
        uploadDate: 'Nov 2026',
        duration: primaryPlatform === 'TikTok' ? '01:24' : '16:40',
        externalUrl: get(
          'viral_url',
          `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`
        ),
        thumbnailTheme: {
          palette: ['#1E242B', '#3A4754', '#1B6E3E'],
          frameCode: `CSV·0${rowIdx}`,
          aspectLabel: primaryPlatform === 'TikTok' ? '9:16 VERTICAL' : '16:9 HD',
          visualMotif:
            category === 'Animation'
              ? 'animation'
              : category === 'Documentary'
              ? 'archive'
              : 'cinema',
          captionOverlay: 'IMPORTED SIGNAL CAPTURE',
        },
        creator: {
          handle: creatorHandle.startsWith('@')
            ? creatorHandle
            : `@${creatorHandle}`,
          displayName: creatorHandle.replace(/^@/, ''),
          followers: get('creator_followers', '48.0K'),
          anomalyRatio: `${anomalyX.toFixed(1)}x vs subscriber baseline`,
          profileUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(creatorHandle)}`,
          country: 'EU',
        },
      },
      recommendation: {
        headline: get(
          'editorial_action',
          `Assign ${category} Analyst for 21-Day Window Verification`
        ),
        rationale: `Scored via Mediawan 4-pillar social model (${calc.emergenceScore}/100) across ${platforms.length} source(s) within ${daysSinceT0}d of t0.`,
        suggestedFormat:
          category === 'Animation'
            ? 'Short-Form / Series Bible Test'
            : category === 'Documentary'
            ? "Feature Doc or 3x52' Docuseries"
            : 'Development Slate Evaluation',
        targetPole: `Mediawan ${category} Desk`,
        targetWindow:
          calc.maturity === 'Early Spark'
            ? 'Re-evaluate by Day 14 inside 21-day window'
            : isPastTrend
            ? 'Archived (>21d horizon)'
            : 'Review in weekly acquisitions meeting',
      },
      drivers,
      limits,
      uncertaintyRisk: {
        level: uncertaintyLevel,
        explanation:
          uncertaintyLevel === 'High Uncertainty'
            ? `Early Spark active for ${daysSinceT0} days across ${platforms.length} platform(s); track creator remixing up to Day 21.`
            : `Imported signal shows ${calc.remixes7d} creator remixes across ${platforms.length} apps.`,
        missingData: hasSearchConfirmation
          ? 'Territory-level retention curve & underlying IP chain-of-title'
          : 'Google Trends search spillover & multi-platform audience retention',
      },
      trajectory,
      votes: [],
      isImported: true,
    });
  }

  return { trends: imported, errors };
}
