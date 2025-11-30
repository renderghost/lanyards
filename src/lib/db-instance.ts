import path from 'path';
import { createDb, migrateToLatest, type Database } from './db';

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!dbInstance) {
    const dbPath = path.join(process.cwd(), 'data', 'lanyards.db');
    console.log('[getDb] Initializing database at:', dbPath);
    dbInstance = createDb(dbPath);
    await migrateToLatest(dbInstance);
  }
  return dbInstance;
}
