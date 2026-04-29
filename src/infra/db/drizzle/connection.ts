import { Pool } from 'pg';
import { getFullEnv } from '@/env/configs.ts';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from '@/infra/db/drizzle/schemas/schema.ts';

const createConnection = () => {
  const { DATABASE_URL, CURRENT_ENV, drizzleMigrationsFolder } = getFullEnv();

  const pool = new Pool({
    connectionString: DATABASE_URL,
    max: CURRENT_ENV === 'production' ? 20 : 5,
  });

  const db = drizzle(pool, { schema });

  if (['test', 'e2e'].includes(CURRENT_ENV)) {
    migrate(db, { migrationsFolder: drizzleMigrationsFolder })
      .then(() => console.log('✅ Test database migrated'))
      .catch((err) => console.error('❌ Migration failed', err));
  }

  return { db, pool };
};

declare global {
  var __DB_INSTANCE__: ReturnType<typeof createConnection>;
}

if (!globalThis.__DB_INSTANCE__) {
  globalThis.__DB_INSTANCE__ = createConnection();
}

const { db, pool } = globalThis.__DB_INSTANCE__;

export const drizzleDatabase = {
  db,
  pool,
  schema,
};

export type DrizzleDatabase = typeof globalThis.__DB_INSTANCE__.db;
