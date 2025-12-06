import path from 'path';
import { createDb, migrateToLatest, type Database } from './db';

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!dbInstance) {
    // Vercel's filesystem is read-only except /tmp
    const dbPath = process.env.VERCEL
      ? '/tmp/lanyards.db'
      : path.join(process.cwd(), 'data', 'lanyards.db');

    console.log('[getDb] Initializing database at:', dbPath);
    dbInstance = createDb(dbPath);
    await migrateToLatest(dbInstance);
  }
  return dbInstance;
}
