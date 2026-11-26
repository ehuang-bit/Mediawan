import fs from 'node:fs';
import path from 'node:path';
import type { MicroTrend } from '../src/types';
import { INITIAL_MICRO_TRENDS } from '../src/data/mockTrends';

export interface SyncMeta {
  lastSyncAt: string | null;
  syncStats: {
    youtubeFeedsOk: number;
    wikiFeedsOk: number;
    durationMs: number;
  };
  backendOnline: boolean;
}

export interface PersistedDatabase {
  version: number;
  lastSyncAt: string | null;
  syncStats: {
    youtubeFeedsOk: number;
    wikiFeedsOk: number;
    durationMs: number;
  };
  trends: MicroTrend[];
}

const DB_VERSION = 8;
const DB_DIR = path.resolve(process.cwd(), 'server', 'data');
export const DB_FILE_PATH = path.join(DB_DIR, 'db.json');

function cloneSeedTrends(): MicroTrend[] {
  return JSON.parse(JSON.stringify(INITIAL_MICRO_TRENDS)) as MicroTrend[];
}

function createInitialDb(): PersistedDatabase {
  return {
    version: DB_VERSION,
    lastSyncAt: null,
    syncStats: {
      youtubeFeedsOk: 0,
      wikiFeedsOk: 0,
      durationMs: 0,
    },
    trends: cloneSeedTrends(),
  };
}

export function readDatabase(): PersistedDatabase {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const seeded = createInitialDb();
      writeDatabase(seeded);
      return seeded;
    }
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<PersistedDatabase>;
    if (
      !parsed ||
      parsed.version !== DB_VERSION ||
      !Array.isArray(parsed.trends) ||
      parsed.trends.length === 0
    ) {
      const seeded = createInitialDb();
      writeDatabase(seeded);
      return seeded;
    }
    return {
      version: DB_VERSION,
      lastSyncAt: parsed.lastSyncAt ?? null,
      syncStats: parsed.syncStats ?? {
        youtubeFeedsOk: 0,
        wikiFeedsOk: 0,
        durationMs: 0,
      },
      trends: parsed.trends,
    };
  } catch {
    const seeded = createInitialDb();
    writeDatabase(seeded);
    return seeded;
  }
}

export function writeDatabase(db: PersistedDatabase): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  const tmpPath = `${DB_FILE_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tmpPath, DB_FILE_PATH);
}

export function resetDatabase(): PersistedDatabase {
  const seeded = createInitialDb();
  writeDatabase(seeded);
  return seeded;
}

export function extractMeta(db: PersistedDatabase): SyncMeta {
  return {
    lastSyncAt: db.lastSyncAt,
    syncStats: db.syncStats,
    backendOnline: true,
  };
}
