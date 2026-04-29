import 'dotenv/config';
import { Pool } from 'pg';
import * as schema from './schemas/schema.ts';
import { drizzle } from 'drizzle-orm/node-postgres';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

export const db = drizzle(pool, { schema });
