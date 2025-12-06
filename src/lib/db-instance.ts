import path from 'path';
import fs from 'fs';
import { createDb, migrateToLatest, type Database } from './db';

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!dbInstance) {
    // For local SQLite, ensure data directory exists
    if (!process.env.POSTGRES_URL) {
      const dataDir = path.join(process.cwd(), 'data');
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // createDb handles environment detection (Postgres vs SQLite)
    dbInstance = createDb();
    await migrateToLatest(dbInstance);
  }
  return dbInstance;
}
