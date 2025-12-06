import { createDb, migrateToLatest, type Database } from './db';

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = createDb();
    await migrateToLatest(dbInstance);
  }
  return dbInstance;
}
