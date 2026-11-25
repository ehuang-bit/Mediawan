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
