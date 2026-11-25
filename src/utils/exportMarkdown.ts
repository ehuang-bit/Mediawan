import { MicroTrend } from '../types';

export function generateOnePagerMarkdown(trend: MicroTrend, rankNumber?: number): string {
  const rankPrefix = rankNumber ? `#${String(rankNumber).padStart(2, '0')} · ` : '';
  const hashtagText =
    trend.hashtags.length > 0
      ? trend.hashtags.map((h) => `#${h}`).join(', ')
      : 'None (organic audio/format spread — no standardized hashtag yet)';

  const votesSection =
    trend.votes.length > 0
      ? trend.votes
          .map(
            (v) =>
              `- **${v.colleagueName}** (*${v.pole}*, ${v.timestamp}): "${v.rationale}"`
          )
          .join('\n')
      : '- No editorial votes recorded yet.';

  const pastEraBlock =
    trend.isPastTrend && trend.pastEraMetadata
      ? `## Past Youth Era Archive Metadata
- **Era Window:** ${trend.pastEraMetadata.eraLabel} (${trend.pastEraMetadata.archetype})
- **Peak Scale:** ${trend.pastEraMetadata.peakScale}
- **Lifespan:** ${trend.pastEraMetadata.lifespanLabel}
- **Why It Faded:** ${trend.pastEraMetadata.whyItFaded}

---

`
      : '';

  return `# MEDIAWAN RADAR — GREENLIGHT ONE-PAGER
> **INTERNAL · MEDIAWAN EDITORIAL SIGNAL INTELLIGENCE**
> Evaluation Horizon: Max 2–3 Weeks (≤21d) Social Breakout Model · Generated ${new Date().toISOString().slice(0, 10)}

---

## ${rankPrefix}${trend.title}

- **Mediawan Vertical:** ${trend.category}
- **Editorial Hook:** ${trend.hook}
- **Social Breakout Score:** **${trend.emergenceScore} / 100** (\`${trend.velocity7d >= 0 ? `+${trend.velocity7d}%` : `${trend.velocity7d}%`}\` 7d velocity)
  - Audio / Format Remix Rate: \`${trend.scoreBreakdown.remixVelocity}/30\` (${trend.scoreBreakdown.remixes7d} remixes/7d)
  - Cross-Platform Spillover: \`${trend.scoreBreakdown.crossPlatformJump}/25\` (${trend.scoreBreakdown.platformsCrossedDays})
  - Saves, Shares & Lore Depth: \`${trend.scoreBreakdown.audienceIntent}/25\` (${trend.scoreBreakdown.saveShareRatio} save+share)
  - Small-Account Algorithmic Lift: \`${trend.scoreBreakdown.smallAccountLift}/20\` (${trend.scoreBreakdown.anomalyMultiplier})
- **First Signal Detected (t0):** ${trend.t0Date} (${trend.daysSinceT0} days ago)
- **Durability / Stage:** ${trend.maturity}
- **Data Certainty:** ${trend.certainty}
- **Watchlist Status:** ${trend.watchlistStatus}
- **Target Cohorts:** ${trend.audiences.join(', ')}
- **Active Platforms:** ${trend.platforms.join(', ')}

---

${pastEraBlock}## Editorial Recommendation

**Recommended Action:** ${trend.recommendation.headline}

${trend.recommendation.rationale}

- **Suggested Audiovisual Format:** ${trend.recommendation.suggestedFormat}
- **Target Mediawan Pole:** ${trend.recommendation.targetPole}
- **Decision Window:** ${trend.recommendation.targetWindow}

---

## Lead Viral Signal Snapshot

- **Title:** ${trend.viralVideo.title}
- **Platform:** ${trend.viralVideo.platform} (${trend.viralVideo.duration})
- **Performance:** ${trend.viralVideo.viewsFormatted} views · ${trend.viralVideo.engagementRate} engagement (${trend.viralVideo.uploadedAgo})
- **Creator:** ${trend.viralVideo.creator.displayName} (${trend.viralVideo.creator.handle} · ${trend.viralVideo.creator.followers} · ${trend.viralVideo.creator.anomalyRatio})
- **Associated Hashtags:** ${hashtagText}
- **Reference Link:** ${trend.viralVideo.externalUrl}

---

## Growth Potential: Drivers vs. Limits

### Why It Can Scale (Drivers)
${trend.drivers.map((d) => `- ${d}`).join('\n')}

### Limits & Friction
${trend.limits.map((l) => `- ${l}`).join('\n')}

### Uncertainty Risk (${trend.uncertaintyRisk.level})
- **Assessment:** ${trend.uncertaintyRisk.explanation}
- **Missing / Unverified Data:** ${trend.uncertaintyRisk.missingData}

---

## Team Votes & Editorial Rationales (${trend.votes.length})
${votesSection}
`;
}

export function downloadTextFile(filename: string, content: string, mimeType = 'text/markdown;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
