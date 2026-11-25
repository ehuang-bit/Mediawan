import {
  AppLang,
  CategoryTab,
  CertaintyLevel,
  MaturityStage,
  MediawanCategory,
  WatchlistStatus,
} from './types';

export const UI_COPY: Record<
  AppLang,
  {
    brandSub: string;
    navRadar: string;
    navPast: string;
    navWatchlist: string;
    navTimeMachine: string;
    navApis: string;
    navWorkspace: string;
    manageApis: string;
    resetData: string;
    promoBadge: string;
    promoTitle: string;
    promoSub: string;
    promoCta: string;
    breadcrumbInternal: string;
    breadcrumbBrand: string;
    socialApisBtn: string;
    connectedApis: string;
    nodeBackendOn: string;
    localFallback: string;
    manageKeys: string;
    syncBtnTitle: string;
    importCsv: string;
    radarTitle: string;
    radarSubtitle: string;
    pastTitle: string;
    pastSubtitle: string;
    kpiFuture: string;
    kpiBreakout: string;
    kpiConfidence: string;
    kpiPastTotal: string;
    kpiPastFlash: string;
    kpiPastOther: string;
    searchPlaceholder: string;
    searchPastPlaceholder: string;
    marketAll: string;
    marketFr: string;
    marketEn: string;
    audienceAll: string;
    windowAll: string;
    windowSpark: string;
    windowBreakout: string;
    certaintyAll: string;
    sortScore: string;
    sortVelocity: string;
    sortVotes: string;
    sortNewest: string;
    shortlistedBtn: string;
    platformLabel: string;
    allSources: string;
    clearFilters: string;
    noMatchTitle: string;
    noMatchSub: string;
    resetFilters: string;
    colTitle: string;
    colPastTitle: string;
    colScore: string;
    colStatus: string;
    colActions: string;
    hoverTitle: string;
    hoverRemix: string;
    hoverCross: string;
    hoverIntent: string;
    hoverLift: string;
    hoverFooterActive: string;
    hoverFooterPast: string;
    eraAll: string;
    eraFlash: string;
    eraSaga: string;
    eraSlang: string;
    prevBtn: string;
    nextBtn: string;
    closeBtn: string;
    statusLabel: string;
    archivedPill: string;
    copyLink: string;
    copied: string;
    exportOnePager: string;
    scoreCardTitle: string;
    lifecycleTitle: string;
    dayOf21: string;
    pastPostMortemTitle: string;
    peakScaleLabel: string;
    lifespanLabel: string;
    whyFadedLabel: string;
    viralVideoTitle: string;
    pastVideoTitle: string;
    watchVideo: string;
    noHashtag: string;
    recTitle: string;
    recFormat: string;
    recPole: string;
    recWindow: string;
    growthTitle: string;
    driversTitle: string;
    limitsTitle: string;
    uncertaintyTitle: string;
    missingData: string;
    trajectoryTitle: string;
    teamVotesTitle: string;
    noVotesYet: string;
    castVoteTitle: string;
    addArchiveNoteTitle: string;
    yourName: string;
    whyTrackPlaceholder: string;
    submitVote: string;
    addedVote: string;
    watchlistTitle: string;
    watchlistSub: string;
    backToRadar: string;
    untrackedHeading: string;
    trackBtn: string;
    noSignalsInCol: string;
    browseRadar: string;
    timeMachineTitle: string;
    timeMachineSub: string;
    detectedEarly: string;
    radarAlert: string;
    peakLabel: string;
    dragSlider: string;
    outcomeLabel: string;
    takeawayLabel: string;
    earlySignal: string;
    optimalWindow: string;
    escalatingComp: string;
    mainstreamSat: string;
    guideTitle: string;
    guideSub: string;
    gotIt: string;
    refineFilters: string;
    viewList: string;
    viewCards: string;
    byCreator: string;
    velocityLabel: string;
    viewsUnit: string;
    engUnit: string;
    retentionLabel: string;
    remixesUnit: string;
    openBrief: string;
    audienceFilterLabel: string;
    windowFilterLabel: string;
    certaintyFilterLabel: string;
    sortByLabel: string;
    radarMapTitle: string;
    radarMapHint: string;
    tabRadar: string;
    tabPast: string;
    tabWatchlist: string;
    tabTimeMachine: string;
    tabMore: string;
    mobileNavLabel: string;
  }
> = {
  en: {
    brandSub: 'Intelligence',
    navRadar: 'Signal Radar',
    navPast: 'Past Trends',
    navWatchlist: 'Editorial Watchlist',
    navTimeMachine: 'Time Machine',
    navApis: 'Social APIs',
    navWorkspace: 'My Workspace',
    manageApis: 'Manage Social APIs',
    resetData: 'Reset workspace',
    promoBadge: '≤21D HORIZON',
    promoTitle: 'Track early waves',
    promoSub: 'FR & EN breakouts 2–3 weeks early.',
    promoCta: 'Scoring model',
    breadcrumbInternal: 'Editorial Studio',
    breadcrumbBrand: 'Mediawan Radar',
    socialApisBtn: 'Social APIs',
    connectedApis: 'Connected Social APIs',
    nodeBackendOn: 'Node API + db.json Persisted',
    localFallback: 'Local Browser Fallback',
    manageKeys: 'Manage API Keys',
    syncBtnTitle: 'Sync live FR & EN feeds',
    importCsv: 'Import CSV',
    radarTitle: 'Signal Radar',
    radarSubtitle: 'France (FR) & English (EN) creators and stories spotted within a strict 21-day window.',
    pastTitle: 'Past Trends',
    pastSubtitle: 'Expired FR & EN youth waves kept separate to prevent late imitation.',
    kpiFuture: 'FR & EN Signals (≤21d)',
    kpiBreakout: 'Breakout Zone (8–21d)',
    kpiConfidence: 'High Confidence',
    kpiPastTotal: 'Archived Youth Eras',
    kpiPastFlash: 'Viral Flash Waves',
    kpiPastOther: 'Multi-Year & Slang Eras',
    searchPlaceholder: 'Search FR/EN creators, formats, hashtags…',
    searchPastPlaceholder: 'Search Quoicoubeh, Skibidi, HUSS HUSS HUSS…',
    marketAll: 'FR + EN',
    marketFr: 'France (FR)',
    marketEn: 'English (EN)',
    audienceAll: 'All audiences',
    windowAll: 'All ≤21d',
    windowSpark: 'Early Spark (1–7d)',
    windowBreakout: 'Breakout Zone (8–21d)',
    certaintyAll: 'All certainty levels',
    sortScore: 'Breakout Score',
    sortVelocity: 'Velocity (7d)',
    sortVotes: 'Team Votes',
    sortNewest: 'Newest (t0)',
    shortlistedBtn: 'Shortlisted',
    platformLabel: 'Platform:',
    allSources: 'All',
    clearFilters: 'Clear',
    noMatchTitle: 'No signals match these filters',
    noMatchSub: 'Try widening market (FR/EN), audience, or platform.',
    resetFilters: 'Reset filters',
    colTitle: 'FR / EN creators & emerging stories',
    colPastTitle: 'Past youth eras & lessons',
    colScore: 'Score',
    colStatus: 'Status',
    colActions: 'Actions',
    hoverTitle: '4-Pillar Breakout Model',
    hoverRemix: 'Audio / format remixes',
    hoverCross: 'Cross-app jump',
    hoverIntent: 'Saves & lore depth',
    hoverLift: 'Small-account lift',
    hoverFooterActive: 'Evaluated inside ≤21d window',
    hoverFooterPast: 'Archived FR/EN youth era',
    eraAll: 'All Eras',
    eraFlash: 'Viral Flash Wave',
    eraSaga: 'Multi-Year Saga',
    eraSlang: 'Slang & Creator Era',
    prevBtn: 'Prev',
    nextBtn: 'Next',
    closeBtn: 'Close',
    statusLabel: 'Status',
    archivedPill: 'Archived Era · Reference',
    copyLink: 'Copy Link',
    copied: 'Copied',
    exportOnePager: 'Export Brief (.md)',
    scoreCardTitle: '4-Pillar Social Evaluation',
    lifecycleTitle: '21-Day Window Position',
    dayOf21: 'of 21d max',
    pastPostMortemTitle: 'Past Era Post-Mortem',
    peakScaleLabel: 'Peak Scale',
    lifespanLabel: 'Lifespan',
    whyFadedLabel: 'Why it faded',
    viralVideoTitle: 'Most Viral Video Right Now',
    pastVideoTitle: 'Iconic Viral Moment',
    watchVideo: 'Watch Video ↗',
    noHashtag: 'No standardized hashtag yet — organic spread',
    recTitle: 'Editorial Recommendation',
    recFormat: 'Format',
    recPole: 'Target Pole',
    recWindow: 'Window',
    growthTitle: 'Drivers vs. Limits',
    driversTitle: 'Why it scaled',
    limitsTitle: 'Limits & friction',
    uncertaintyTitle: 'Uncertainty Risk',
    missingData: 'Missing data:',
    trajectoryTitle: 'Cross-Platform Trajectory',
    teamVotesTitle: 'Team Votes',
    noVotesYet: 'No team votes yet.',
    castVoteTitle: 'Cast your vote',
    addArchiveNoteTitle: 'Add archive note',
    yourName: 'Your name',
    whyTrackPlaceholder: 'Why should Mediawan track or option this?',
    submitVote: 'Submit vote',
    addedVote: 'Added',
    watchlistTitle: 'Editorial Watchlist',
    watchlistSub: 'Shortlisted FR & EN signals progressing toward outreach.',
    backToRadar: 'Back to Radar',
    untrackedHeading: 'Untracked ≤21d signals',
    trackBtn: 'Track',
    noSignalsInCol: 'No signals yet',
    browseRadar: 'Browse Radar',
    timeMachineTitle: 'Time Machine',
    timeMachineSub: 'Verified historical timelines proving early detection before studio deals.',
    detectedEarly: 'Detected',
    radarAlert: 'Radar Alert',
    peakLabel: 'Peak',
    dragSlider: 'Scrub timeline',
    outcomeLabel: 'Outcome',
    takeawayLabel: 'Mediawan Takeaway',
    earlySignal: 'Early Signal',
    optimalWindow: 'Optimal Option Window',
    escalatingComp: 'Rising Competition',
    mainstreamSat: 'Mainstream Peak',
    guideTitle: '21-Day Breakout Scoring Model',
    guideSub: 'How Mediawan spots FR & EN waves 2–3 weeks early.',
    gotIt: 'Got it',
    refineFilters: 'Refine',
    viewList: 'List',
    viewCards: 'Cards',
    byCreator: 'by',
    velocityLabel: '7d Momentum',
    viewsUnit: 'views',
    engUnit: 'eng.',
    retentionLabel: 'Viewer retention curve',
    remixesUnit: 'remixes (7d)',
    openBrief: 'Read brief',
    audienceFilterLabel: 'Audience',
    windowFilterLabel: 'Window',
    certaintyFilterLabel: 'Certainty',
    sortByLabel: 'Sort by',
    radarMapTitle: 'Signal map',
    radarMapHint: 'Closer to the centre = newer. Bigger dot = higher score. The number is the rank.',
    tabRadar: 'Radar',
    tabPast: 'Past',
    tabWatchlist: 'Watchlist',
    tabTimeMachine: 'History',
    tabMore: 'More',
    mobileNavLabel: 'Main navigation',
  },
  fr: {
    brandSub: 'Intelligence',
    navRadar: 'Signal Radar',
    navPast: 'Tendances passées',
    navWatchlist: 'Veille éditoriale',
    navTimeMachine: 'Time Machine',
    navApis: 'APIs sociales',
    navWorkspace: 'Mon espace',
    manageApis: 'Gérer les APIs sociales',
    resetData: 'Réinitialiser',
    promoBadge: 'HORIZON ≤21J',
    promoTitle: 'Repérer tôt',
    promoSub: 'Signaux FR & EN 2–3 sem. avant le pic.',
    promoCta: 'Modèle de score',
    breadcrumbInternal: 'Espace Éditorial',
    breadcrumbBrand: 'Mediawan Radar',
    socialApisBtn: 'APIs sociales',
    connectedApis: 'APIs sociales connectées',
    nodeBackendOn: 'API Node + db.json persisté',
    localFallback: 'Mode navigateur local',
    manageKeys: 'Configurer les clés',
    syncBtnTitle: 'Synchroniser les flux live FR & EN',
    importCsv: 'Importer CSV',
    radarTitle: 'Signal Radar',
    radarSubtitle: 'Créateurs et récits France (FR) & Anglais (EN) repérés sur une fenêtre stricte de 21 jours max.',
    pastTitle: 'Tendances passées',
    pastSubtitle: 'Ères jeunesse FR & EN déjà passées, archivées pour éviter d’arriver trop tard.',
    kpiFuture: 'Signaux FR & EN (≤21j)',
    kpiBreakout: 'Zone d’éclosion (8–21j)',
    kpiConfidence: 'Confiance élevée',
    kpiPastTotal: 'Ères jeunesse archivées',
    kpiPastFlash: 'Vagues flash',
    kpiPastOther: 'Sagas & ères argot',
    searchPlaceholder: 'Chercher créateur FR/EN, format, hashtag…',
    searchPastPlaceholder: 'Chercher Quoicoubeh, Skibidi, HUSS HUSS HUSS…',
    marketAll: 'FR + EN',
    marketFr: 'France (FR)',
    marketEn: 'Anglais (EN)',
    audienceAll: 'Tous les publics',
    windowAll: 'Toute fenêtre ≤21j',
    windowSpark: 'Étincelle (1–7j)',
    windowBreakout: 'Zone active (8–21j)',
    certaintyAll: 'Toutes certitudes',
    sortScore: 'Score d’éclosion',
    sortVelocity: 'Vélocité (7j)',
    sortVotes: 'Votes équipe',
    sortNewest: 'Plus récent (t0)',
    shortlistedBtn: 'Suivis',
    platformLabel: 'Source :',
    allSources: 'Toutes',
    clearFilters: 'Effacer',
    noMatchTitle: 'Aucun signal ne correspond',
    noMatchSub: 'Élargissez le marché (FR/EN), le public ou la plateforme.',
    resetFilters: 'Réinitialiser',
    colTitle: 'Créateurs & tendances FR / EN',
    colPastTitle: 'Ères jeunesse passées & leçons',
    colScore: 'Score',
    colStatus: 'Statut',
    colActions: 'Actions',
    hoverTitle: 'Modèle social 4 piliers',
    hoverRemix: 'Remix audio / format',
    hoverCross: 'Passage inter-apps',
    hoverIntent: 'Saves & profondeur',
    hoverLift: 'Percée petits comptes',
    hoverFooterActive: 'Évalué sous ≤21 jours',
    hoverFooterPast: 'Archive jeunesse FR/EN',
    eraAll: 'Toutes',
    eraFlash: 'Vague flash',
    eraSaga: 'Saga multi-années',
    eraSlang: 'Ère argot & créateurs',
    prevBtn: 'Préc.',
    nextBtn: 'Suiv.',
    closeBtn: 'Fermer',
    statusLabel: 'Statut',
    archivedPill: 'Ère archivée · Référence',
    copyLink: 'Copier le lien',
    copied: 'Copié',
    exportOnePager: 'Exporter (.md)',
    scoreCardTitle: 'Évaluation sociale 4 piliers',
    lifecycleTitle: 'Position fenêtre 21 jours',
    dayOf21: 'sur 21j max',
    pastPostMortemTitle: 'Bilan de l’ère passée',
    peakScaleLabel: 'Pic atteint',
    lifespanLabel: 'Durée de vie',
    whyFadedLabel: 'Pourquoi c’est retombé',
    viralVideoTitle: 'Vidéo virale du moment',
    pastVideoTitle: 'Moment viral marquant',
    watchVideo: 'Voir la vidéo ↗',
    noHashtag: 'Pas de hashtag fixe — propagation organique',
    recTitle: 'Recommandation éditoriale',
    recFormat: 'Format',
    recPole: 'Pôle cible',
    recWindow: 'Fenêtre',
    growthTitle: 'Moteurs vs. Limites',
    driversTitle: 'Pourquoi ça prend',
    limitsTitle: 'Limites & risques',
    uncertaintyTitle: 'Niveau d’incertitude',
    missingData: 'Données manquantes :',
    trajectoryTitle: 'Trajectoire inter-plateformes',
    teamVotesTitle: 'Votes équipe',
    noVotesYet: 'Aucun vote pour l’instant.',
    castVoteTitle: 'Voter sur ce signal',
    addArchiveNoteTitle: 'Ajouter une note',
    yourName: 'Votre nom',
    whyTrackPlaceholder: 'Pourquoi Mediawan devrait suivre ou optionner ?',
    submitVote: 'Envoyer le vote',
    addedVote: 'Ajouté',
    watchlistTitle: 'Veille éditoriale',
    watchlistSub: 'Signaux FR & EN retenus en cours d’évaluation.',
    backToRadar: 'Retour au Radar',
    untrackedHeading: 'Signaux ≤21j non suivis',
    trackBtn: 'Suivre',
    noSignalsInCol: 'Aucun signal',
    browseRadar: 'Explorer le Radar',
    timeMachineTitle: 'Time Machine',
    timeMachineSub: 'Cas historiques datés prouvant la détection avant les rachats studios.',
    detectedEarly: 'Détecté',
    radarAlert: 'Alerte Radar',
    peakLabel: 'Pic',
    dragSlider: 'Faire défiler',
    outcomeLabel: 'Résultat',
    takeawayLabel: 'Leçon Mediawan',
    earlySignal: 'Signal précoce',
    optimalWindow: 'Fenêtre optimale',
    escalatingComp: 'Concurrence forte',
    mainstreamSat: 'Pic grand public',
    guideTitle: 'Modèle de scoring 21 jours',
    guideSub: 'Comment Mediawan repère les vagues FR & EN 2–3 semaines avant le pic.',
    gotIt: 'Compris',
    refineFilters: 'Affiner',
    viewList: 'Liste',
    viewCards: 'Cartes',
    byCreator: 'par',
    velocityLabel: 'Élan (7j)',
    viewsUnit: 'vues',
    engUnit: 'eng.',
    retentionLabel: 'Courbe de rétention',
    remixesUnit: 'remixes (7j)',
    openBrief: 'Lire la fiche',
    audienceFilterLabel: 'Public',
    windowFilterLabel: 'Fenêtre',
    certaintyFilterLabel: 'Certitude',
    sortByLabel: 'Trier par',
    radarMapTitle: 'Radar vivant',
    radarMapHint: 'Près du centre = récent. Gros point = score élevé. Le chiffre est le rang.',
    tabRadar: 'Radar',
    tabPast: 'Passées',
    tabWatchlist: 'Veille',
    tabTimeMachine: 'Machine',
    tabMore: 'Plus',
    mobileNavLabel: 'Navigation principale',
  },
};

export function getTimeGreeting(lang: AppLang, now = new Date()): string {
  const h = now.getHours();
  if (lang === 'fr') {
    if (h >= 18 || h < 5) return 'Bonsoir, équipe éditoriale';
    if (h >= 12) return 'Bon après-midi, équipe éditoriale';
    return 'Bonjour, équipe éditoriale';
  }
  if (h >= 18 || h < 5) return 'Good evening, editorial team';
  if (h >= 12) return 'Good afternoon, editorial team';
  return 'Good morning, editorial team';
}

export function translateCategory(cat: CategoryTab, lang: AppLang): string {
  if (lang === 'en') return cat;
  const map: Record<CategoryTab, string> = {
    'All Signals': 'Tous',
    Fiction: 'Fiction',
    Animation: 'Animation',
    Documentary: 'Documentaire',
    Entertainment: 'Divertissement',
    Talents: 'Talents',
    'Past Trends': 'Tendances passées',
  };
  return map[cat] ?? cat;
}

export function translateMaturity(stage: MaturityStage, lang: AppLang): string {
  if (lang === 'en') {
    return stage === 'Breakout Zone' ? 'Breakout' : stage;
  }
  const map: Record<MaturityStage, string> = {
    'Early Spark': 'Étincelle',
    'Breakout Zone': 'Zone active',
    'Past Era': 'Ère passée',
  };
  return map[stage];
}

export function translateCertainty(level: CertaintyLevel, lang: AppLang): string {
  if (lang === 'en') return level;
  const map: Record<CertaintyLevel, string> = {
    'High Confidence': 'Confiance élevée',
    'To Confirm': 'À confirmer',
    'High Uncertainty': 'Incertitude haute',
  };
  return map[level];
}

export function translateWatchlist(status: WatchlistStatus, lang: AppLang): string {
  if (lang === 'en') return status;
  const map: Record<WatchlistStatus, string> = {
    'Not Tracked': 'Non suivi',
    Monitoring: 'Veille',
    'Under Review': 'En examen',
    'Outreach Started': 'Contact initié',
  };
  return map[status];
}

export function translateMediawanCategory(cat: MediawanCategory, lang: AppLang): string {
  return translateCategory(cat, lang);
}

/** French versions of short labels that are hard-coded in components or data. */
const FR_LABELS: Record<string, string> = {
  'Sync Ready': 'Prêt à synchroniser',
  Live: 'En direct',
  Baseline: 'Données initiales',
  NEW: 'NOUVEAU',
  Today: 'Aujourd’hui',
  Recent: 'Récent',
  'Radar Score': 'Score radar',
  Mentions: 'Mentions',
  Creators: 'Créateurs',
  'Creator Replication': 'Reprises par les créateurs',
  'Niche Incubator': 'Niche de départ',
  'Social Velocity': 'Vélocité sociale',
  'PEAK REPLAY': 'PIC DE REVISIONNAGE',
  'RADAR ALERT': 'ALERTE RADAR',
  PEAK: 'PIC',
  Grade: 'Note',
  'Past Era (P)': 'Ère passée (P)',
  Low: 'Faible',
  Moderate: 'Modéré',
  'High Uncertainty': 'Incertitude haute',
  'Kids 9–14': 'Enfants 9–14 ans',
  'High School 15–18': 'Lycéens 15–18 ans',
  'Gen Z 18–25': 'Gen Z 18–25 ans',
  'Close API manager': 'Fermer le gestionnaire d’API',
  'Close modal': 'Fermer la fenêtre',
  'Close quick guide': 'Fermer le guide',
  'Previous month': 'Mois précédent',
  'Next month': 'Mois suivant',
  'Mediawan pole': 'Pôle Mediawan',
  'Expand sidebar': 'Déplier le menu',
  'Collapse sidebar': 'Replier le menu',
  'Primary navigation': 'Navigation principale',
  'Mediawan vertical themes': 'Thématiques Mediawan',
  'Clear search query': 'Effacer la recherche',
  'Market language filter': 'Filtre de marché',
  'Layout view': 'Affichage',
  Audience: 'Public',
  Window: 'Fenêtre',
  Certainty: 'Certitude',
  'Sort by': 'Trier par',
  Language: 'Langue',
  'Switch to Light Mode': 'Passer en mode clair',
  'Switch to Dark Mode': 'Passer en mode sombre',
  'Remove from Watchlist': 'Retirer de la veille',
  'Add to Watchlist': 'Ajouter à la veille',
  'Short-form trends, viral sounds & creator replication speed':
    'Formats courts, sons viraux et vitesse de reprise par les créateurs',
  'Long-form views, watch retention & small-creator breakouts':
    'Vues longues, rétention et percées de petits créateurs',
  'Reels momentum, saves, audio shares & visual creators':
    'Élan des Reels, enregistrements, partages audio et créateurs visuels',
  'Public Reels reach, regional groups & cross-age shares':
    'Portée des Reels publics, groupes régionaux et partages entre âges',
  'Early niche fan communities, book clubs & lore threads':
    'Communautés de fans de niche, clubs de lecture et fils sur les univers',
  'Confirms when a niche trend enters mainstream search':
    'Confirme quand une tendance de niche arrive dans les recherches grand public',
};

export function tr(text: string, lang: AppLang): string {
  if (lang === 'en') return text;
  return FR_LABELS[text] ?? text;
}

/** "8 days ago", "8d ago", "Today" */
export function translateAge(text: string, lang: AppLang): string {
  if (lang === 'en') return text;
  const match = text.match(/^(\d+)\s*(?:d|days?) ago$/);
  if (!match) return tr(text, lang);
  return `il y a ${match[1]} jour${match[1] === '1' ? '' : 's'}`;
}

/** "5.0 months early" */
export function translateLeadTime(text: string, lang: AppLang): string {
  if (lang === 'en') return text;
  const match = text.match(/^([\d.]+) months early$/);
  if (!match) return text;
  return `${match[1].replace(/\.0$/, '').replace('.', ',')} mois d’avance`;
}

/** "Jan 2026 (M-7) · Alert Triggered (Score: 87)" */
export function translateAlertLabel(text: string, lang: AppLang): string {
  if (lang === 'en') return text;
  return text
    .replace('Alert Triggered', 'Alerte déclenchée')
    .replace('Score:', 'score :');
}

/** "Nov 17, 2026" */
export function translateDate(text: string, lang: AppLang): string {
  if (lang === 'en') return text;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    ...(/\d{1,2},/.test(text) ? { year: 'numeric' } : {}),
  });
}
