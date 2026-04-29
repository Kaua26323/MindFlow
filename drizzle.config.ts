import 'dotenv/config';
import path from 'path';
import { defineConfig } from 'drizzle-kit';

const drizzleSchemaPath = path.join('src/infra/db/drizzle/schemas/schema.ts');
const drizzleMigrationsFolder = path.join('src/infra/db/drizzle/migrations');

export default defineConfig({
  dialect: 'postgresql',
  schema: drizzleSchemaPath,
  out: drizzleMigrationsFolder,
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
});
