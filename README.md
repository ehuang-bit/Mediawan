# Mediawan Radar

Plateforme éditoriale FR / EN de détection précoce des micro-tendances sociales (fenêtre ≤ 21 jours) et d’archives jeunesse (*Tendances passées*), dotée d’un backend Node/Vite avec synchronisation live (flux YouTube Atom RSS + Wikimedia REST) et d’une interface bilingue (`FR` / `EN`) en mode clair/sombre.

## Prérequis

- **Node.js 18+** et **npm**

## Démarrage rapide (en équipe)

```bash
npm install
npm run dev
```

L’application démarre en local sur `http://localhost:5173/`. Au premier lancement, le backend crée automatiquement `server/data/db.json` et synchronise les flux publics.

### Build de production

```bash
npm run build
```

## Architecture

- `src/` — Interface React + TypeScript + Tailwind CSS (`SignalRadarView`, `EditorialWatchlistView`, `BacktestingView`, `GreenlightDrawer`, `i18n.ts`)
- `server/` — Middleware API monté sur Vite (`apiPlugin.ts`, `liveIngest.ts`, `scoringEngine.ts`, `store.ts`)

## Problème, utilisateurs, décision

- **Pour qui** : équipes développement et acquisitions de Mediawan (fiction, animation, documentaire, divertissement, talents).
- **Décision éclairée** : acquérir ou développer des droits, développer ou adapter un format, approcher un talent.
- **Succès** : repérer un contenu ou un talent avant qu’il atteigne le grand public, vérifié a posteriori dans la *Time Machine* (backtest).

## « Ça devient une tendance ? » — le verdict

Chaque signal reçoit un verdict **Agir / Surveiller / Trop tôt**, basé sur 5 critères vérifiables (`src/utils/verdict.ts`) :

| Critère | Seuil |
|---|---|
| Ça accélère | +150 % de mentions sur 7 jours |
| Ça se diffuse | présent sur 4 plateformes ou plus |
| Les créateurs s’en emparent | 200 reprises ou plus en 7 jours |
| Le signal est fiable | confirmé par plusieurs sources indépendantes |
| Il est encore temps | apparu il y a 21 jours ou moins |

- **Agir** : score ≥ 90, signal confirmé et au moins 4 critères sur 5.
- **Surveiller** : score ≥ 80 ou au moins 3 critères.
- **Trop tôt** : le reste.

## Sources de données

| Source | Statut | Accès |
|---|---|---|
| YouTube | En direct | YouTube Data API v3 (clé gratuite) + flux RSS publics |
| Wikipedia | En direct | Wikimedia Pageviews API, ouverte, sans clé |
| Google Trends | Snapshot | export CSV du site public, importé avec « Importer CSV » (format reconnu automatiquement) |
| Reddit | Accès réservé | API sur approbation, usage non commercial |
| TikTok | Accès réservé | Research API réservée aux chercheurs d’organismes à but non lucratif |
| Instagram / Facebook | Accès réservé | Meta Content Library réservée aux chercheurs approuvés |

Données publiques uniquement, API officielles, pas de scraping, aucune donnée personnelle. Les signaux de départ sont un jeu de données de démonstration ; les flux YouTube et Wikipédia les mettent à jour en direct (bouton ↻).
