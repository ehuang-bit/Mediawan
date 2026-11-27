import { AppLang, MicroTrend } from '../types';
import {
  translateCertainty,
  translateMaturity,
  translateMediawanCategory,
  translateWatchlist,
} from '../i18n';
import { getVerdict, verdictLabel } from './verdict';

/**
 * Normalizes punctuation outside Latin-1 so jsPDF Helvetica (WinAnsi)
 * keeps all French accents (é, è, ê, à, ç, ô, ù, î, É, È, À, Ç) crisp
 * with zero garbled glyphs.
 */
function cleanPdfText(input: string | undefined | null): string {
  if (!input) return '';
  return input
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, ' - ')
    .replace(/\u2026/g, '...')
    .replace(/\u2264/g, '<=')
    .replace(/\u2265/g, '>=')
    .replace(/\u0153/g, 'oe')
    .replace(/\u0152/g, 'OE')
    .replace(/\u2197/g, '->')
    .replace(/\u2192/g, '->')
    .replace(/\u2022/g, '-')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x20-\x7E\xA0-\xFF\n]/g, '')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\s+\n/g, '\n')
    .trim();
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function tryLoadImageDataUrl(url?: string): Promise<string | null> {
  if (!url) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(url, { mode: 'cors', signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buf = await res.arrayBuffer();
    if (buf.byteLength < 1000) return null;
    return `data:${contentType};base64,${arrayBufferToBase64(buf)}`;
  } catch {
    return null;
  }
}

export async function exportTrendPdf(
  trend: MicroTrend,
  lang: AppLang,
  rankNumber?: number
): Promise<string> {
  const { jsPDF } = await import('jspdf');

  const isFr = lang === 'fr';
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageW = 210;
  const pageH = 297;
  const margin = 13;
  const contentW = pageW - margin * 2; // 184mm

  // Pop Stickers Mediawan Palette
  const INK: [number, number, number] = [29, 29, 31];
  const INK_2: [number, number, number] = [69, 66, 59];
  const INK_3: [number, number, number] = [107, 102, 89];
  const CANVAS: [number, number, number] = [247, 241, 225];
  const SOFT: [number, number, number] = [251, 249, 243];
  const LINE: [number, number, number] = [217, 209, 189];
  const POP: [number, number, number] = [255, 100, 69];
  const LILAC: [number, number, number] = [164, 138, 255];
  const GOLD: [number, number, number] = [209, 193, 116];
  const ACCENT: [number, number, number] = [79, 55, 196];
  const DANGER: [number, number, number] = [163, 38, 15];
  const DANGER_SOFT: [number, number, number] = [255, 227, 220];
  const WHITE: [number, number, number] = [255, 255, 255];

  const today = new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const verdictRes = getVerdict(trend, lang);
  const verdictText = cleanPdfText(verdictLabel(verdictRes.verdict, lang)).toUpperCase();
  const categoryText = cleanPdfText(translateMediawanCategory(trend.category, lang));
  const maturityText = cleanPdfText(translateMaturity(trend.maturity, lang));
  const certaintyText = cleanPdfText(translateCertainty(trend.certainty, lang));
  const watchlistText = cleanPdfText(translateWatchlist(trend.watchlistStatus, lang));

  const drawPill = (
    x: number,
    y: number,
    text: string,
    bg: [number, number, number],
    fg: [number, number, number],
    border: [number, number, number] = INK,
    fontSize = 7.2
  ): number => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fontSize);
    const label = cleanPdfText(text);
    const tw = doc.getTextWidth(label);
    const pw = tw + 5.6;
    const ph = 5.2;
    doc.setFillColor(...bg);
    doc.setDrawColor(...border);
    doc.setLineWidth(0.32);
    doc.roundedRect(x, y, pw, ph, 2.6, 2.6, 'FD');
    doc.setTextColor(...fg);
    doc.text(label, x + 2.8, y + 3.65);
    return pw;
  };

  let y = 0;

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > pageH - 14) {
      doc.addPage();
      doc.setFillColor(...CANVAS);
      doc.rect(0, 0, pageW, 11, 'F');
      doc.setDrawColor(...INK);
      doc.setLineWidth(0.45);
      doc.line(0, 11, pageW, 11);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...INK);
      doc.text('mediawan  |  SIGNAL RADAR', margin, 7.2);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...INK_3);
      doc.text(cleanPdfText(trend.title).slice(0, 62), pageW - margin, 7.2, {
        align: 'right',
      });
      y = 16;
    }
  };

  // =========================================================================
  // 1. HEADER BANNER (Warm Mediawan Pop-Stickers Masthead)
  // =========================================================================
  doc.setFillColor(...CANVAS);
  doc.rect(0, 0, pageW, 24.5, 'F');
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.65);
  doc.line(0, 24.5, pageW, 24.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17.5);
  doc.setTextColor(...INK);
  doc.text('mediawan', margin, 11.8);
  const mwWidth = doc.getTextWidth('mediawan');
  doc.setTextColor(...POP);
  doc.text('*', margin + mwWidth + 0.5, 11.8);

  drawPill(margin + mwWidth + 5, 7.2, 'SIGNAL RADAR', LILAC, INK, INK, 6.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(...INK_2);
  doc.text(
    cleanPdfText(
      isFr
        ? 'FICHE ÉDITORIALE DE VEILLE & ACQUISITIONS · DOCUMENT INTERNE'
        : 'EDITORIAL SIGNAL INTELLIGENCE BRIEF · INTERNAL DOCUMENT'
    ),
    margin,
    18.8
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(...INK_3);
  doc.text(cleanPdfText(`${isFr ? 'Généré le' : 'Generated'} ${today}`), pageW - margin, 9.5, {
    align: 'right',
  });

  const verdictBg: [number, number, number] =
    verdictRes.verdict === 'act'
      ? POP
      : verdictRes.verdict === 'watch'
      ? LILAC
      : verdictRes.verdict === 'early'
      ? GOLD
      : DANGER_SOFT;
  const verdictFg: [number, number, number] =
    verdictRes.verdict === 'archive' ? DANGER : INK;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  const vWidth = doc.getTextWidth(verdictText) + 6;
  drawPill(pageW - margin - vWidth, 13.5, verdictText, verdictBg, verdictFg, INK, 7.4);

  y = 29;

  // =========================================================================
  // 2. META PILLS + TITLE + HOOK
  // =========================================================================
  let px = margin;
  if (rankNumber !== undefined) {
    px += drawPill(px, y, `#${String(rankNumber).padStart(2, '0')}`, POP, INK, INK) + 1.8;
  }
  px += drawPill(px, y, categoryText, GOLD, INK, INK) + 1.8;
  px += drawPill(px, y, trend.market, WHITE, INK_2, LINE) + 1.8;
  px +=
    drawPill(
      px,
      y,
      trend.isPastTrend && trend.pastEraMetadata
        ? `${maturityText} · ${trend.pastEraMetadata.eraLabel}`
        : `${maturityText} · ${trend.daysSinceT0}${isFr ? 'j' : 'd'}`,
      trend.isPastTrend ? DANGER_SOFT : SOFT,
      trend.isPastTrend ? DANGER : ACCENT,
      LINE
    ) + 1.8;
  if (!trend.isPastTrend && trend.watchlistStatus !== 'Not Tracked') {
    drawPill(px, y, watchlistText, SOFT, INK_2, LINE);
  }

  y += 9.8;

  // Main Title (set font BEFORE splitTextToSize!)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...INK);
  const titleLines = doc.splitTextToSize(cleanPdfText(trend.title), contentW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 6 + 1;

  // Editorial Hook
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...INK_2);
  const hookLines = doc.splitTextToSize(cleanPdfText(trend.hook), contentW);
  doc.text(hookLines, margin, y);
  y += hookLines.length * 4.2 + 3.5;

  // =========================================================================
  // 3. EXECUTIVE KPI STRIP (4 Clean Cards)
  // =========================================================================
  const kpiGap = 3.2;
  const kpiW = (contentW - kpiGap * 3) / 4;
  const kpiH = 15.5;
  const velStr = trend.velocity7d >= 0 ? `+${trend.velocity7d}%` : `${trend.velocity7d}%`;

  const kpis = [
    {
      label: isFr ? 'SCORE GLOBAL' : 'OVERALL SCORE',
      value: `${trend.emergenceScore} / 100`,
      accent: INK,
    },
    {
      label: isFr ? 'ÉLAN (7 JOURS)' : '7D MOMENTUM',
      value: velStr,
      accent: trend.velocity7d >= 0 ? ACCENT : DANGER,
    },
    {
      label: trend.isPastTrend
        ? isFr
          ? 'PÉRIODE'
          : 'ERA WINDOW'
        : isFr
        ? 'DÉTECTION (t0)'
        : 'DETECTED (t0)',
      value:
        trend.isPastTrend && trend.pastEraMetadata
          ? cleanPdfText(trend.pastEraMetadata.eraLabel)
          : cleanPdfText(trend.t0Date),
      accent: INK,
    },
    {
      label: isFr ? 'CERTITUDE' : 'CERTAINTY',
      value: certaintyText,
      accent: ACCENT,
    },
  ];

  kpis.forEach((k, idx) => {
    const kx = margin + idx * (kpiW + kpiGap);
    doc.setFillColor(...SOFT);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.32);
    doc.roundedRect(kx, y, kpiW, kpiH, 2.8, 2.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.6);
    doc.setTextColor(...INK_3);
    doc.text(cleanPdfText(k.label), kx + 3, y + 4.8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(k.value.length > 14 ? 9 : 11.8);
    doc.setTextColor(...k.accent);
    doc.text(cleanPdfText(k.value), kx + 3, y + 11.8);
  });

  y += kpiH + 4.5;

  // =========================================================================
  // 4. TWO-COLUMN SECTION: LEAD VISUAL SIGNAL (Left) + 4 PILLARS (Right)
  // =========================================================================
  const colGap = 4.5;
  const leftW = 82;
  const rightW = contentW - leftW - colGap; // 97.5mm
  const midH = 58.5;

  // Left card container
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.35);
  doc.roundedRect(margin, y, leftW, midH, 3.2, 3.2, 'FD');

  const thumbH = 35;
  const thumbDataUrl = await tryLoadImageDataUrl(trend.viralVideo.thumbnailUrl);
  if (thumbDataUrl) {
    try {
      const format = thumbDataUrl.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(thumbDataUrl, format, margin + 1.6, y + 1.6, leftW - 3.2, thumbH, undefined, 'FAST');
    } catch {
      doc.setFillColor(...INK);
      doc.roundedRect(margin + 1.6, y + 1.6, leftW - 3.2, thumbH, 2.2, 2.2, 'F');
    }
  } else {
    doc.setFillColor(...INK);
    doc.roundedRect(margin + 1.6, y + 1.6, leftW - 3.2, thumbH, 2.2, 2.2, 'F');
    // Sleek play icon badge
    doc.setFillColor(...POP);
    doc.roundedRect(margin + leftW / 2 - 7, y + 12, 14, 10, 2.5, 2.5, 'F');
    doc.setFillColor(...WHITE);
    doc.triangle(
      margin + leftW / 2 - 2,
      y + 14.5,
      margin + leftW / 2 - 2,
      y + 19.5,
      margin + leftW / 2 + 3.2,
      y + 17,
      'F'
    );
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...WHITE);
    doc.text(cleanPdfText(trend.viralVideo.platform.toUpperCase()), margin + 4.5, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...GOLD);
    doc.text(
      cleanPdfText(`${trend.viralVideo.viewsFormatted} ${isFr ? 'vues' : 'views'} · ${trend.viralVideo.duration}`),
      margin + 4.5,
      y + 32.5
    );
  }

  // Video meta below thumbnail
  const vidTextY = y + thumbH + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(...INK);
  const vidTitleLines = doc
    .splitTextToSize(cleanPdfText(trend.viralVideo.title), leftW - 6)
    .slice(0, 2);
  doc.text(vidTitleLines, margin + 3, vidTextY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...INK_2);
  doc.text(
    cleanPdfText(
      `${trend.viralVideo.creator.handle} · ${trend.viralVideo.viewsFormatted} ${isFr ? 'vues' : 'views'} · ${trend.viralVideo.engagementRate}`
    ),
    margin + 3,
    vidTextY + 8.5
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  doc.setTextColor(...ACCENT);
  doc.textWithLink(
    cleanPdfText(isFr ? 'Ouvrir la vidéo source ->' : 'Open source video ->'),
    margin + 3,
    vidTextY + 13.5,
    { url: trend.viralVideo.externalUrl }
  );

  // Right card: 4-Pillar Score Breakdown
  const rx = margin + leftW + colGap;
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.35);
  doc.roundedRect(rx, y, rightW, midH, 3.2, 3.2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(
    cleanPdfText(isFr ? 'Évaluation sociale (4 piliers)' : '4-Pillar Social Scoring'),
    rx + 4,
    y + 6.4
  );

  const pillars = [
    {
      label: isFr ? 'Remix audio / format' : 'Audio / format remixes',
      score: trend.scoreBreakdown.remixVelocity,
      max: 30,
      proof: `${trend.scoreBreakdown.remixes7d} remixes (7${isFr ? 'j' : 'd'})`,
    },
    {
      label: isFr ? 'Passage inter-plateformes' : 'Cross-platform jump',
      score: trend.scoreBreakdown.crossPlatformJump,
      max: 25,
      proof: trend.scoreBreakdown.platformsCrossedDays,
    },
    {
      label: isFr ? 'Saves & profondeur univers' : 'Saves & lore depth',
      score: trend.scoreBreakdown.audienceIntent,
      max: 25,
      proof: `${trend.scoreBreakdown.saveShareRatio} save+share`,
    },
    {
      label: isFr ? 'Percée petits comptes' : 'Small-account lift',
      score: trend.scoreBreakdown.smallAccountLift,
      max: 20,
      proof: `${trend.scoreBreakdown.anomalyMultiplier}`,
    },
  ];

  const barColor: [number, number, number] = trend.isPastTrend ? GOLD : POP;
  let py = y + 12.2;
  for (const p of pillars) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(...INK);
    doc.text(cleanPdfText(p.label), rx + 4, py);

    doc.setTextColor(...ACCENT);
    doc.text(`${p.score}/${p.max}`, rx + rightW - 4, py, { align: 'right' });

    const barW = rightW - 8;
    const fillW = Math.max(2, (Math.min(p.score, p.max) / p.max) * barW);
    doc.setFillColor(...CANVAS);
    doc.roundedRect(rx + 4, py + 1.4, barW, 2.2, 1.1, 1.1, 'F');
    doc.setFillColor(...barColor);
    doc.roundedRect(rx + 4, py + 1.4, fillW, 2.2, 1.1, 1.1, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...INK_3);
    doc.text(cleanPdfText(p.proof), rx + 4, py + 6.6);

    py += 11.4;
  }

  y += midH + 4.5;

  // =========================================================================
  // 5. EDITORIAL RECOMMENDATION / ARCHIVE CALLOUT (Exact Height Measurement)
  // =========================================================================
  const recInnerW = contentW - 11;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.8);
  const recHeadLines = doc.splitTextToSize(cleanPdfText(trend.recommendation.headline), recInnerW);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.1);
  const recRatLines = doc.splitTextToSize(cleanPdfText(trend.recommendation.rationale), recInnerW);

  let pastPeakLines: string[] = [];
  let pastFadeLines: string[] = [];
  if (trend.isPastTrend && trend.pastEraMetadata) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.6);
    pastPeakLines = doc.splitTextToSize(
      cleanPdfText(`${isFr ? 'Pic & Rachat' : 'Peak & Deal'} : ${trend.pastEraMetadata.peakScale}`),
      recInnerW
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    pastFadeLines = doc.splitTextToSize(
      cleanPdfText(`${isFr ? 'Statut' : 'Status'} : ${trend.pastEraMetadata.whyItFaded}`),
      recInnerW
    );
  }

  const metaColW = (contentW - 14) / 3;
  const metaCols = [
    { label: isFr ? 'FORMAT SUGGÉRÉ' : 'SUGGESTED FORMAT', val: trend.recommendation.suggestedFormat },
    { label: isFr ? 'PÔLE CIBLE' : 'TARGET POLE', val: trend.recommendation.targetPole },
    { label: isFr ? 'FENÊTRE' : 'DECISION WINDOW', val: trend.recommendation.targetWindow },
  ];
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  const metaValLineGroups = metaCols.map((mc) =>
    doc.splitTextToSize(cleanPdfText(mc.val), metaColW - 2)
  );
  const maxMetaLines = Math.max(...metaValLineGroups.map((g) => g.length));
  const metaSectionH = 4 + 3.8 + maxMetaLines * 3.4 + 2.5;

  const pastSectionH =
    trend.isPastTrend && trend.pastEraMetadata
      ? pastPeakLines.length * 3.6 + pastFadeLines.length * 3.6 + 2.5
      : 0;

  const recBoxH =
    10.5 +
    recHeadLines.length * 4.2 +
    1.5 +
    recRatLines.length * 3.7 +
    2 +
    pastSectionH +
    metaSectionH;

  ensureSpace(recBoxH + 4);

  doc.setFillColor(...CANVAS);
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.45);
  doc.roundedRect(margin, y, contentW, recBoxH, 3.2, 3.2, 'FD');

  doc.setFillColor(...(trend.isPastTrend ? GOLD : POP));
  doc.roundedRect(margin, y, 2.5, recBoxH, 1.2, 1.2, 'F');

  let ry = y + 5.8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  doc.setTextColor(...ACCENT);
  doc.text(
    cleanPdfText(
      trend.isPastTrend
        ? isFr
          ? "BILAN D'ACQUISITION & ENSEIGNEMENT MEDIAWAN"
          : 'ACQUISITION POST-MORTEM & MEDIAWAN BENCHMARK'
        : isFr
        ? 'RECOMMANDATION ÉDITORIALE MEDIAWAN'
        : 'MEDIAWAN EDITORIAL RECOMMENDATION'
    ),
    margin + 6,
    ry
  );

  ry += 4.6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.8);
  doc.setTextColor(...INK);
  doc.text(recHeadLines, margin + 6, ry);
  ry += recHeadLines.length * 4.2 + 1.2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.1);
  doc.setTextColor(...INK_2);
  doc.text(recRatLines, margin + 6, ry);
  ry += recRatLines.length * 3.7 + 1.8;

  if (trend.isPastTrend && trend.pastEraMetadata) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.6);
    doc.setTextColor(...DANGER);
    doc.text(pastPeakLines, margin + 6, ry);
    ry += pastPeakLines.length * 3.6 + 0.8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    doc.setTextColor(...INK_2);
    doc.text(pastFadeLines, margin + 6, ry);
    ry += pastFadeLines.length * 3.6 + 1.8;
  }

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.25);
  doc.line(margin + 6, ry, margin + contentW - 4, ry);
  ry += 3.8;

  metaCols.forEach((mc, i) => {
    const mx = margin + 6 + i * (metaColW + 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.6);
    doc.setTextColor(...INK_3);
    doc.text(cleanPdfText(mc.label), mx, ry);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...INK);
    doc.text(metaValLineGroups[i], mx, ry + 3.5);
  });

  y += recBoxH + 4.5;

  // =========================================================================
  // 6. TWO-COLUMN DRIVERS vs. LIMITS & UNCERTAINTY
  // =========================================================================
  const halfW = (contentW - colGap) / 2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  const driverBlocks = trend.drivers.map((d) =>
    doc.splitTextToSize(`- ${cleanPdfText(d)}`, halfW - 8)
  );
  const limitBlocks = trend.limits.map((l) =>
    doc.splitTextToSize(`- ${cleanPdfText(l)}`, halfW - 8)
  );
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.3);
  const riskLines = doc.splitTextToSize(
    cleanPdfText(`${isFr ? 'Risque' : 'Risk'} (${trend.uncertaintyRisk.level}) : ${trend.uncertaintyRisk.explanation}`),
    halfW - 8
  );

  const leftContentH =
    11.5 + driverBlocks.reduce((acc, b) => acc + b.length * 3.6 + 1.6, 0) + 2;
  const rightContentH =
    11.5 +
    limitBlocks.reduce((acc, b) => acc + b.length * 3.6 + 1.6, 0) +
    riskLines.length * 3.4 +
    3;
  const dlBoxH = Math.max(leftContentH, rightContentH, 28);

  ensureSpace(dlBoxH + 4);

  // Left: Drivers
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.32);
  doc.roundedRect(margin, y, halfW, dlBoxH, 3.2, 3.2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.4);
  doc.setTextColor(...ACCENT);
  doc.text(
    cleanPdfText(isFr ? 'Moteurs (Pourquoi ça prend)' : 'Growth Drivers'),
    margin + 4,
    y + 6
  );

  let dy = y + 11;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(...INK_2);
  for (const lines of driverBlocks) {
    doc.text(lines, margin + 4, dy);
    dy += lines.length * 3.6 + 1.6;
  }

  // Right: Limits & Risk
  const lrx = margin + halfW + colGap;
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.32);
  doc.roundedRect(lrx, y, halfW, dlBoxH, 3.2, 3.2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.4);
  doc.setTextColor(...DANGER);
  doc.text(
    cleanPdfText(isFr ? "Limites & Risque d'incertitude" : 'Limits & Uncertainty Risk'),
    lrx + 4,
    y + 6
  );

  let ly = y + 11;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(...INK_2);
  for (const lines of limitBlocks) {
    doc.text(lines, lrx + 4, ly);
    ly += lines.length * 3.6 + 1.6;
  }
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.3);
  doc.setTextColor(...INK_3);
  doc.text(riskLines, lrx + 4, ly + 0.6);

  y += dlBoxH + 4.5;

  // =========================================================================
  // 7. PLATFORMS, AUDIENCES & TEAM VOTES
  // =========================================================================
  const votesToRender = trend.votes.slice(0, 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const voteLineGroups = votesToRender.map((v) =>
    doc.splitTextToSize(
      cleanPdfText(`${v.colleagueName} (${v.pole}) : "${v.rationale}"`),
      contentW - 8
    )
  );
  const footerBoxH =
    14.5 +
    (votesToRender.length > 0
      ? voteLineGroups.reduce((acc, g) => acc + g.length * 3.4 + 1.4, 0) + 2
      : 5.5);

  ensureSpace(footerBoxH + 2);

  doc.setFillColor(...SOFT);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.32);
  doc.roundedRect(margin, y, contentW, footerBoxH, 3.2, 3.2, 'FD');

  let fy = y + 5.6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  doc.setTextColor(...INK);
  doc.text(
    cleanPdfText(
      `${isFr ? 'Publics cibles' : 'Target Audiences'} : ${trend.audiences.join(', ')}   |   ${isFr ? 'Sources' : 'Platforms'} : ${trend.platforms.join(', ')}`
    ),
    margin + 4,
    fy
  );

  fy += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(...ACCENT);
  doc.text(
    cleanPdfText(
      `${isFr ? 'Notes & votes équipe' : 'Team Votes & Editorial Notes'} (${trend.votes.length})`
    ),
    margin + 4,
    fy
  );
  fy += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...INK_2);
  if (voteLineGroups.length === 0) {
    doc.text(
      cleanPdfText(isFr ? 'Aucun vote éditorial enregistré.' : 'No team votes recorded yet.'),
      margin + 4,
      fy
    );
  } else {
    for (const lines of voteLineGroups) {
      doc.text(lines, margin + 4, fy);
      fy += lines.length * 3.4 + 1.4;
    }
  }

  // =========================================================================
  // 8. PAGE FOOTERS
  // =========================================================================
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.28);
    doc.line(margin, pageH - 10.5, pageW - margin, pageH - 10.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(...INK_3);
    doc.text(
      cleanPdfText(
        isFr
          ? 'Mediawan Signal Radar · Veille Éditoriale & Acquisitions'
          : 'Mediawan Signal Radar · Editorial Intelligence & Acquisitions'
      ),
      margin,
      pageH - 6.5
    );
    doc.text(
      cleanPdfText(`Page ${p} / ${pageCount}  |  ${today}`),
      pageW - margin,
      pageH - 6.5,
      { align: 'right' }
    );
  }

  const slug = trend.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);
  const filename = `mediawan-fiche-${slug || trend.id}.pdf`;
  doc.save(filename);
  return filename;
}
