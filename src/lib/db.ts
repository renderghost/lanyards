import {
  Kysely,
  Migration,
  MigrationProvider,
  Migrator,
  PostgresDialect,
} from 'kysely';
import { Pool as NeonPool } from '@neondatabase/serverless';

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

export const createDb = (): Database => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL environment variable is required');
  }

  console.log('[createDb] Using Postgres (Neon)');
  return new Kysely<DatabaseSchema>({
    dialect: new PostgresDialect({
      pool: new NeonPool({
        connectionString: process.env.POSTGRES_URL,
      }),
    }),
  });
};

export const migrateToLatest = async (db: Database) => {
  const migrator = new Migrator({ db, provider: migrationProvider });
  const { error } = await migrator.migrateToLatest();
  if (error) throw error;
};

export type Database = Kysely<DatabaseSchema>;
