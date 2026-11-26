export type AppLang = 'en' | 'fr';

export type ThemeMode = 'light' | 'dark';

export type TrendMarket = 'FR' | 'EN' | 'FR / EN';

export type MarketFilter = 'All' | 'FR' | 'EN';

export type MediawanCategory =
  | 'Fiction'
  | 'Animation'
  | 'Documentary'
  | 'Entertainment'
  | 'Talents';

export type CategoryTab = 'All Signals' | MediawanCategory | 'Past Trends';

export type PersonaCohort =
  | 'Kids 9–14'
  | 'High School 15–18'
  | 'Gen Z 18–25';

export type PersonaFilter = 'All Audiences' | PersonaCohort;

export type MaturityStage = 'Early Spark' | 'Breakout Zone' | 'Past Era';

export type MaturityFilter =
  | 'All'
  | 'Early Spark (1–7d)'
  | 'Breakout Zone (8–21d)'
  | 'Past Era (Archived)';

export type CertaintyLevel =
  | 'High Confidence'
  | 'To Confirm'
  | 'High Uncertainty';

export type CertaintyFilter = 'All' | CertaintyLevel;

export type PlatformSource =
  | 'TikTok'
  | 'YouTube'
  | 'Instagram'
  | 'Facebook'
  | 'Reddit'
  | 'Google Trends'
  | 'Wikipedia'
  | 'Wattpad/Webtoon'
  | 'Roblox/Twitch';

export type ApiId =
  | 'youtube'
  | 'wikipedia'
  | 'google_trends'
  | 'reddit'
  | 'tiktok'
  | 'meta';

/** live = collected automatically · snapshot = public export imported by hand · restricted = no access for a student team */
export type SourceStatus = 'live' | 'snapshot' | 'restricted';

export interface BilingualText {
  fr: string;
  en: string;
}

export interface ApiConnectorConfig {
  id: ApiId;
  name: string;
  platform: PlatformSource;
  description: string;
  enabled: boolean;
  apiKey: string;
  endpointLabel: string;
  supportsBrowserFetch?: boolean;
  status: SourceStatus;
  /** What the radar takes from this source */
  collects: BilingualText;
  /** How we access it, and the rules we respect */
  access: BilingualText;
  docsUrl: string;
}

export type SortOption =
  | 'Emergence Score (Default)'
  | 'Velocity (7d)'
  | 'Most Team Votes'
  | 'Newest (t0)';

export type WatchlistStatus =
  | 'Not Tracked'
  | 'Monitoring'
  | 'Under Review'
  | 'Outreach Started';

export type UncertaintyRiskLevel = 'Low' | 'Moderate' | 'High Uncertainty';

export interface ScoreBreakdown {
  remixVelocity: number; // /30 — Audio & Format Remix Rate
  crossPlatformJump: number; // /25 — Cross-Platform Spillover (<=21d)
  audienceIntent: number; // /25 — Saves, Shares & Lore Depth
  smallAccountLift: number; // /20 — Small-Account Algorithmic Lift (<50K)
  remixes7d: number; // independent creator remixes/adaptations in last 7d
  saveShareRatio: string; // e.g., "18.4%"
  anomalyMultiplier: string; // e.g., "16.2x"
  platformsCrossedDays: string; // e.g., "4 apps in 12d"
}

export interface PastEraMetadata {
  eraLabel: string;
  peakScale: string;
  lifespanLabel: string;
  whyItFaded: string;
  archetype: 'Viral Flash Wave' | 'Multi-Year Saga' | 'Slang & Creator Era';
}

export interface ViralVideoSnapshot {
  title: string;
  platform: PlatformSource;
  viewsFormatted: string;
  engagementRate: string;
  uploadedAgo: string;
  uploadDate: string;
  duration: string;
  externalUrl: string;
  thumbnailUrl?: string;
  thumbnailTheme: {
    palette: [string, string, string];
    frameCode: string;
    aspectLabel: string;
    visualMotif: 'cinema' | 'animation' | 'archive' | 'stage' | 'creator' | 'gaming';
    captionOverlay: string;
  };
  creator: {
    handle: string;
    displayName: string;
    followers: string;
    anomalyRatio: string;
    profileUrl: string;
    country: string;
  };
}

export interface EditorialRecommendation {
  headline: string;
  rationale: string;
  suggestedFormat: string;
  targetPole: string;
  targetWindow: string;
}

export interface TrajectoryPoint {
  dayLabel: string;
  nicheIncubator: number;
  socialVelocity: number;
  mainstreamSearch: number;
}

export interface TeamVote {
  id: string;
  colleagueName: string;
  initials: string;
  pole: string;
  timestamp: string;
  rationale: string;
}

export interface MicroTrend {
  id: string;
  title: string;
  hook: string;
  category: MediawanCategory;
  market: TrendMarket;
  audiences: PersonaCohort[];
  daysSinceT0: number;
  t0Date: string;
  emergenceScore: number;
  velocity7d: number;
  rankMovement: {
    type: 'up' | 'down' | 'new' | 'same';
    delta?: number;
  };
  scoreBreakdown: ScoreBreakdown;
  maturity: MaturityStage;
  certainty: CertaintyLevel;
  platforms: PlatformSource[];
  hashtags: string[];
  watchlistStatus: WatchlistStatus;
  viralVideo: ViralVideoSnapshot;
  recommendation: EditorialRecommendation;
  drivers: string[];
  limits: string[];
  uncertaintyRisk: {
    level: UncertaintyRiskLevel;
    explanation: string;
    missingData: string;
  };
  trajectory: TrajectoryPoint[];
  votes: TeamVote[];
  isImported?: boolean;
  isLiveApi?: boolean;
  isPastTrend?: boolean;
  pastEraMetadata?: PastEraMetadata;
  liveMeta?: {
    source: string;
    fetchedAt: string;
    realViews?: number;
    wikiViews14d?: number;
    realPublishedDate?: string;
  };
}

export interface BacktestMonthlySnapshot {
  monthOffset: number;
  monthLabel: string;
  calendarDate: string;
  radarScore: number;
  creatorReplication: number;
  googleTrends: number;
  nicheMentionsCount: string;
  activeCreatorsCount: number;
  googleTrendsRaw: number;
  marketStatus: string;
  editorialLog: string;
}

export interface BacktestCaseStudy {
  id: string;
  shortTabTitle: string;
  archetypeLabel: string;
  title: string;
  category: MediawanCategory;
  leadTimeMonths: string;
  detectionMonthOffset: number;
  detectionScore: number;
  detectionDateLabel: string;
  peakMonthOffset: number;
  peakDateLabel: string;
  summary: string;
  outcome: string;
  mediawanLesson: string;
  timeline: BacktestMonthlySnapshot[];
}
