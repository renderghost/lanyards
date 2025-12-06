import {
  Kysely,
  Migration,
  MigrationProvider,
  Migrator,
  SqliteDialect,
  PostgresDialect,
} from 'kysely';
import { Pool as NeonPool } from '@neondatabase/serverless';
import SqliteDb from 'better-sqlite3';

// Types

export type DatabaseSchema = {
  auth_session: AuthSession;
  auth_state: AuthState;
};

export type AuthSession = {
  key: string;
  session: string;
};

export type AuthState = {
  key: string;
  state: string;
};

// Migrations

const migrations: Record<string, Migration> = {};

const migrationProvider: MigrationProvider = {
  async getMigrations() {
    return migrations;
  },
};

migrations['001'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .createTable('auth_session')
      .addColumn('key', 'varchar', (col) => col.primaryKey())
      .addColumn('session', 'varchar', (col) => col.notNull())
      .execute();
    await db.schema
      .createTable('auth_state')
      .addColumn('key', 'varchar', (col) => col.primaryKey())
      .addColumn('state', 'varchar', (col) => col.notNull())
      .execute();
  },
  async down(db: Kysely<unknown>) {
    await db.schema.dropTable('auth_state').execute();
    await db.schema.dropTable('auth_session').execute();
  },
};

// APIs

export const createDb = (location?: string): Database => {
  // Use Postgres on Vercel (when POSTGRES_URL is set)
  // Use SQLite for local development
  if (process.env.POSTGRES_URL) {
    console.log('[createDb] Using Postgres (Neon)');
    return new Kysely<DatabaseSchema>({
      dialect: new PostgresDialect({
        pool: new NeonPool({
          connectionString: process.env.POSTGRES_URL,
        }),
      }),
    });
  }

  // Local development with SQLite
  console.log('[createDb] Using SQLite for local development');
  const dbPath = location || 'data/lanyards.db';
  return new Kysely<DatabaseSchema>({
    dialect: new SqliteDialect({
      database: new SqliteDb(dbPath),
    }),
  });
};

export const migrateToLatest = async (db: Database) => {
  const migrator = new Migrator({ db, provider: migrationProvider });
  const { error } = await migrator.migrateToLatest();
  if (error) throw error;
};

export type Database = Kysely<DatabaseSchema>;
