import type { MaturityStage, CertaintyLevel, ScoreBreakdown } from '../src/types';

export interface ServerScoreOutput {
  emergenceScore: number;
  scoreBreakdown: ScoreBreakdown;
  maturity: MaturityStage;
  certainty: CertaintyLevel;
}

export function computeBreakoutScore(params: {
  daysSinceT0: number;
  velocity7d: number;
  creatorCount7d: number;
  anomalyX: number;
  platformCount: number;
  saveSharePct?: number;
}): ServerScoreOutput {
  const { daysSinceT0, velocity7d, creatorCount7d, anomalyX, platformCount, saveSharePct } = params;
  const isPastEra = daysSinceT0 > 21;
  const horizonPenalty = isPastEra ? 0.55 : daysSinceT0 < 7 ? 0.85 : 1.0;

  const rawRemix = Math.round(
    (Math.min(300, Math.max(0, velocity7d)) / 240) * 18 * horizonPenalty +
      Math.min(12, Math.log2(Math.max(2, creatorCount7d + 1)) * 2.2)
  );
  const remixVelocity = Math.max(8, Math.min(30, rawRemix));

  const rawCross = Math.round(
    (Math.min(5, platformCount) * 4.6 + (daysSinceT0 <= 21 ? 3 : 0)) * horizonPenalty
  );
  const crossPlatformJump = Math.max(6, Math.min(25, rawCross));

  const rawIntent = Math.round(
    (Math.min(20, anomalyX) / 18) * 14 * horizonPenalty + Math.min(11, platformCount * 2.2)
  );
  const audienceIntent = Math.max(6, Math.min(25, rawIntent));

  const rawLift = Math.round((Math.min(20, anomalyX) / 18) * 19 * horizonPenalty);
  const smallAccountLift = Math.max(5, Math.min(20, rawLift));

  const emergenceScore = Math.min(
    98,
    Math.max(30, remixVelocity + crossPlatformJump + audienceIntent + smallAccountLift)
  );

  const maturity: MaturityStage =
    daysSinceT0 <= 7 ? 'Early Spark' : daysSinceT0 <= 21 ? 'Breakout Zone' : 'Past Era';

  const certainty: CertaintyLevel =
    daysSinceT0 < 7 || platformCount <= 1
      ? 'High Uncertainty'
      : platformCount >= 3 && creatorCount7d >= 20
      ? 'High Confidence'
      : 'To Confirm';

  const remixes7d = Math.max(12, Math.round(creatorCount7d * 4.5));
  const computedSaveShare =
    saveSharePct !== undefined ? saveSharePct : Math.min(26, Math.max(4, anomalyX * 1.15));

  return {
    emergenceScore,
    maturity,
    certainty,
    scoreBreakdown: {
      remixVelocity,
      crossPlatformJump,
      audienceIntent,
      smallAccountLift,
      remixes7d,
      saveShareRatio: `${computedSaveShare.toFixed(1)}%`,
      anomalyMultiplier: `${anomalyX.toFixed(1)}x`,
      platformsCrossedDays: `${platformCount} app${platformCount > 1 ? 's' : ''} in ${Math.min(21, Math.max(1, daysSinceT0))}d`,
    },
  };
}

export function formatCompactViews(views: number): string {
  if (!Number.isFinite(views) || views <= 0) return '0';
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B`;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${Math.round(views / 1_000)}K`;
  return String(Math.round(views));
}

export function formatAgeLabel(isoDate: string): {
  daysAgo: number;
  uploadedAgo: string;
  uploadDateFormatted: string;
} {
  const pub = new Date(isoDate);
  if (Number.isNaN(pub.getTime())) {
    return { daysAgo: 7, uploadedAgo: 'Recent', uploadDateFormatted: 'Nov 2026' };
  }
  const now = new Date();
  const diffDays = Math.max(0, Math.round((now.getTime() - pub.getTime()) / 86_400_000));
  const uploadedAgo =
    diffDays === 0 ? 'Today' : diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  const uploadDateFormatted = pub.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return { daysAgo: diffDays, uploadedAgo, uploadDateFormatted };
}
