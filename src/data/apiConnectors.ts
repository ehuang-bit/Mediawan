import { ApiConnectorConfig } from '../types';

/**
 * Data sources of the radar — documented honestly for the jury:
 * what is collected, how, and under which rules.
 * 2 live sources + 1 public export + platforms we observe but cannot collect.
 */
export const DEFAULT_API_CONNECTORS: ApiConnectorConfig[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    platform: 'YouTube',
    description: 'Creators, formats and views of new uploads',
    enabled: true,
    apiKey: '',
    endpointLabel: 'YouTube Data API v3 + RSS',
    supportsBrowserFetch: true,
    status: 'live',
    collects: {
      fr: 'Vues, date de publication et chaînes des nouvelles vidéos : repère les créateurs et formats qui décollent.',
      en: 'Views, upload date and channel of new videos: spots creators and formats taking off.',
    },
    access: {
      fr: 'API officielle (clé Google gratuite, quota journalier) + flux RSS publics des chaînes. Uniquement des données publiques.',
      en: 'Official API (free Google key, daily quota) + public channel RSS feeds. Public data only.',
    },
    docsUrl: 'https://developers.google.com/youtube/v3',
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    platform: 'Wikipedia',
    description: 'Daily page views: when the wider public starts looking',
    enabled: true,
    apiKey: '',
    endpointLabel: 'Wikimedia Pageviews API',
    status: 'live',
    collects: {
      fr: 'Vues quotidiennes des pages d’une œuvre ou d’un créateur : mesure quand le grand public commence à se renseigner.',
      en: 'Daily views of a title’s or creator’s page: shows when the wider public starts looking it up.',
    },
    access: {
      fr: 'API publique et ouverte, sans clé. Données agrégées, aucune donnée personnelle.',
      en: 'Open public API, no key. Aggregated data, no personal data.',
    },
    docsUrl: 'https://wikimedia.org/api/rest_v1/',
  },
  {
    id: 'google_trends',
    name: 'Google Trends',
    platform: 'Google Trends',
    description: 'Confirms when a niche trend reaches mainstream search',
    enabled: true,
    apiKey: '',
    endpointLabel: 'trends.google.com · CSV export',
    status: 'snapshot',
    collects: {
      fr: 'Intérêt de recherche (indice 0-100) par mot-clé et par pays : confirme le passage au grand public.',
      en: 'Search interest (0-100 index) by keyword and country: confirms the jump to the mainstream.',
    },
    access: {
      fr: 'Export CSV depuis le site public, importé avec « Importer CSV ». L’API officielle est en alpha, sur candidature.',
      en: 'CSV export from the public website, loaded with “Import CSV”. The official API is in alpha, on application.',
    },
    docsUrl: 'https://developers.google.com/search/apis/trends',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    platform: 'Reddit',
    description: 'Niche fan communities, book clubs and lore threads',
    enabled: true,
    apiKey: '',
    endpointLabel: 'Reddit Data API',
    status: 'restricted',
    collects: {
      fr: 'Communautés de fans de niche : souvent le tout premier signal.',
      en: 'Niche fan communities: often the very first signal.',
    },
    access: {
      fr: 'API sur approbation, usage non commercial uniquement. Pas de scraping : on observe à la main en attendant.',
      en: 'API on approval, non-commercial use only. No scraping: observed manually meanwhile.',
    },
    docsUrl: 'https://www.redditinc.com/policies/data-api-terms',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    platform: 'TikTok',
    description: 'Short-form trends, sounds and creator replication',
    enabled: true,
    apiKey: '',
    endpointLabel: 'TikTok Research API',
    status: 'restricted',
    collects: {
      fr: 'Formats courts et sons viraux. Observé indirectement : reprises sur YouTube et recherches Google.',
      en: 'Short formats and viral sounds. Observed indirectly: re-uploads on YouTube and Google searches.',
    },
    access: {
      fr: 'Research API réservée aux chercheurs d’organismes à but non lucratif, sur dossier. Pas accessible à une équipe étudiante.',
      en: 'Research API limited to non-profit researchers, on application. Not available to a student team.',
    },
    docsUrl: 'https://developers.tiktok.com/products/research-api',
  },
  {
    id: 'meta',
    name: 'Instagram / Facebook',
    platform: 'Instagram',
    description: 'Reels momentum and visual creators',
    enabled: true,
    apiKey: '',
    endpointLabel: 'Meta Content Library',
    status: 'restricted',
    collects: {
      fr: 'Reels et créateurs visuels. Observé indirectement, comme TikTok.',
      en: 'Reels and visual creators. Observed indirectly, like TikTok.',
    },
    access: {
      fr: 'Meta Content Library réservée aux chercheurs approuvés. Pas accessible à une équipe étudiante.',
      en: 'Meta Content Library limited to approved researchers. Not available to a student team.',
    },
    docsUrl: 'https://transparency.meta.com/researchtools/meta-content-library',
  },
];
