import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const DATA_DIR = path.resolve(process.cwd(), 'backend', 'data');
const DEFAULT_DB_FILE = path.join(DATA_DIR, 'db.sqlite3');

function ensureDataDir() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

/**
 * getDb(options)
 * - If process.env.DATABASE_URL === ':memory:' or process.env.USE_IN_MEMORY_DB === '1' will return an in-memory DB.
 * - Otherwise returns a Database opened at DATABASE_URL or DEFAULT_DB_FILE.
 */
export function getDb() {
  const useMemory =
    process.env.DATABASE_URL === ':memory:' || process.env.USE_IN_MEMORY_DB === '1';

  if (!useMemory) {
    ensureDataDir();
    const filename = process.env.DATABASE_URL || DEFAULT_DB_FILE;
    // open read/write, create if missing
    return new Database(filename, { verbose: null });
  } else {
    return new Database(':memory:');
  }
}

// Export the path where the DB would live on disk (useful for compatibility)
export const DB_FILE_PATH = process.env.DATABASE_URL || DEFAULT_DB_FILE;
export const DATA_DIRECTORY = DATA_DIR;