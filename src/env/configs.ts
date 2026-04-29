import { z } from 'zod';
import { join } from 'path';

const envSchema = z.object({
  CURRENT_ENV: z.enum(['development', 'test', 'e2e', 'production']),
  DATABASE_URL: z
    .string()
    .min(1, 'Database URL is required')
    .refine(
      (val) => val.startsWith('postgresql://') || val.startsWith('postgres://'),
      { message: 'URL must be a valid PostgreSQL address' },
    ),

  PORT: z.coerce.number().default(4000),
  SESSION_SECRET: z
    .string()
    .min(32, 'Secret must be at least 32 characters long'),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error('Invalid environment variables:');
  console.error(z.treeifyError(_env.error));
  throw new Error('Check the .env files and configurations.');
}

export const env = _env.data;

const commonKeys = {
  drizzleSchemaFiles: [
    join('src', 'infra', 'db', 'drizzle', 'schemas', 'schema.ts'),
  ],
  drizzleMigrationsFolder: join('src', 'infra', 'db', 'drizzle', 'migrations'),
};

export function getFullEnv() {
  return {
    ...env,
    ...commonKeys,
  };
}
