import { defineConfig } from 'drizzle-kit';
import { getFullEnv } from '@/env/configs.ts';

const { DATABASE_URL, drizzleSchemaFiles, drizzleMigrationsFolder } =
  getFullEnv();

export default defineConfig({
  dialect: 'postgresql',
  schema: drizzleSchemaFiles,
  out: drizzleMigrationsFolder,
  dbCredentials: {
    url: DATABASE_URL,
  },
});
