import type { AppLang, MediawanCategory, MicroTrend } from '../types';

/**
 * "Is this becoming a trend?" — turns the raw signal into an editorial verdict.
 * Five transparent checks, each explainable to a Mediawan jury in one sentence.
 */
export type Verdict = 'act' | 'watch' | 'early' | 'archive';

export interface VerdictCheck {
  id: 'acceleration' | 'spread' | 'replication' | 'reliability' | 'window';
  passed: boolean;
  label: string;
  detail: string;
}

export interface VerdictResult {
  verdict: Verdict;
  passedCount: number;
  checks: VerdictCheck[];
  decisionType: string;
}

export const VERDICT_THRESHOLDS = {
  actScore: 90,
  watchScore: 80,
  acceleration: 150, // % growth over 7 days
  platforms: 4,
  replication: 200, // independent creator remixes in 7 days
  windowDays: 21,
};

export function decisionTypeFor(category: MediawanCategory, lang: AppLang): string {
  const fr: Record<MediawanCategory, string> = {
    Fiction: 'Acquérir ou développer les droits',
    Animation: 'Développer ou coproduire',
    Documentary: 'Développer un format documentaire',
    Entertainment: 'Adapter ou licencier le format',
    Talents: 'Approcher le talent',
  };
  const en: Record<MediawanCategory, string> = {
    Fiction: 'Acquire or develop the rights',
    Animation: 'Develop or co-produce',
    Documentary: 'Develop a documentary format',
    Entertainment: 'Adapt or license the format',
    Talents: 'Approach the talent',
  };
  return (lang === 'fr' ? fr : en)[category];
}

export function getVerdict(trend: MicroTrend, lang: AppLang): VerdictResult {
  const fr = lang === 'fr';
  const T = VERDICT_THRESHOLDS;
  const platformCount = trend.platforms.length;
  const remixes = trend.scoreBreakdown.remixes7d;

  const checks: VerdictCheck[] = [
    {
      id: 'acceleration',
      passed: trend.velocity7d >= T.acceleration,
      label: fr ? 'Ça accélère' : 'It is accelerating',
      detail: fr
        ? `${trend.velocity7d > 0 ? '+' : ''}${trend.velocity7d} % de mentions sur 7 jours (seuil : +${T.acceleration} %)`
        : `${trend.velocity7d > 0 ? '+' : ''}${trend.velocity7d}% mentions over 7 days (threshold: +${T.acceleration}%)`,
    },
    {
      id: 'spread',
      passed: platformCount >= T.platforms,
      label: fr ? 'Ça se diffuse' : 'It is spreading',
      detail: fr
        ? `Vu sur ${platformCount} plateformes (seuil : ${T.platforms})`
        : `Seen on ${platformCount} platforms (threshold: ${T.platforms})`,
    },
    {
      id: 'replication',
      passed: remixes >= T.replication,
      label: fr ? 'Les créateurs s’en emparent' : 'Creators pick it up',
      detail: fr
        ? `${remixes} reprises par des créateurs indépendants en 7 j (seuil : ${T.replication})`
        : `${remixes} remixes by independent creators in 7d (threshold: ${T.replication})`,
    },
    {
      id: 'reliability',
      passed: trend.certainty === 'High Confidence',
      label: fr ? 'Le signal est fiable' : 'The signal is reliable',
      detail:
        trend.certainty === 'High Confidence'
          ? fr
            ? 'Confirmé par plusieurs sources indépendantes'
            : 'Confirmed by several independent sources'
          : fr
          ? 'Pas encore confirmé par plusieurs sources'
          : 'Not yet confirmed by several sources',
    },
    {
      id: 'window',
      passed: !trend.isPastTrend && trend.daysSinceT0 <= T.windowDays,
      label: fr ? 'Il est encore temps' : 'There is still time',
      detail: trend.isPastTrend
        ? fr
          ? 'Pic déjà passé'
          : 'Peak already passed'
        : fr
        ? `Apparu il y a ${trend.daysSinceT0} j (fenêtre : ${T.windowDays} j)`
        : `Emerged ${trend.daysSinceT0}d ago (window: ${T.windowDays}d)`,
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const reliable = checks[3].passed;

  let verdict: Verdict;
  if (trend.isPastTrend) verdict = 'archive';
  else if (trend.emergenceScore >= T.actScore && reliable && passedCount >= 4) verdict = 'act';
  else if (trend.emergenceScore >= T.watchScore || passedCount >= 3) verdict = 'watch';
  else verdict = 'early';

  return {
    verdict,
    passedCount,
    checks,
    decisionType: decisionTypeFor(trend.category, lang),
  };
}

export function verdictLabel(v: Verdict, lang: AppLang): string {
  const fr: Record<Verdict, string> = {
    act: 'Agir',
    watch: 'Surveiller',
    early: 'Trop tôt',
    archive: 'Archive',
  };
  const en: Record<Verdict, string> = {
    act: 'Act now',
    watch: 'Watch',
    early: 'Too early',
    archive: 'Archive',
  };
  return (lang === 'fr' ? fr : en)[v];
}

export function verdictSentence(v: Verdict, lang: AppLang): string {
  const fr: Record<Verdict, string> = {
    act: 'Devient une tendance : à présenter en comité cette semaine.',
    watch: 'Signal prometteur mais incomplet : à revoir dans 7 jours.',
    early: 'Trop tôt pour conclure : on laisse le radar tourner.',
    archive: 'Tendance passée : sert de référence pour calibrer le radar.',
  };
  const en: Record<Verdict, string> = {
    act: 'Becoming a trend: bring it to the committee this week.',
    watch: 'Promising but incomplete: review again in 7 days.',
    early: 'Too early to tell: let the radar keep running.',
    archive: 'Past trend: used as a benchmark to calibrate the radar.',
  };
  return (lang === 'fr' ? fr : en)[v];
}

/** Tailwind classes using the app's semantic tokens. */
export function verdictClasses(v: Verdict): string {
  switch (v) {
    case 'act':
      return 'bg-pop text-on-pop border-pop';
    case 'watch':
      return 'bg-warn-soft text-warn border-warn-line';
    case 'early':
      return 'bg-soft text-ink-2 border-line';
    default:
      return 'bg-danger-soft text-danger border-danger-line';
  }
}
