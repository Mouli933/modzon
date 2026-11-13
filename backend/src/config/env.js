import 'dotenv/config';
import { z } from 'zod';

const environmentSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DB_SSL: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  CLIENT_URL: z.string().url(),
  VERCEL_PROJECT_PRODUCTION_URL: z.string().regex(/^[a-zA-Z0-9.-]+$/).optional(),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).optional(),
  GITHUB_OWNER: z.string().min(1).default('Mouli372'),
  GITHUB_REPO: z.string().min(1).default('MODSZONE-GAME-FILES'),
  GITHUB_BRANCH: z.string().min(1).default('main'),
  GITHUB_ACCESS_MODE: z.enum(['redirect']).default('redirect'),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const issues = parsedEnvironment.error.issues
    .map(({ path, message }) => `${path.join('.')}: ${message}`)
    .join('\n');
  console.error(`Invalid backend environment configuration:\n${issues}`);
  process.exit(1);
}

const values = parsedEnvironment.data;
const clientOrigins = new Set([new URL(values.CLIENT_URL).origin]);
if (values.VERCEL_PROJECT_PRODUCTION_URL) {
  clientOrigins.add(new URL(`https://${values.VERCEL_PROJECT_PRODUCTION_URL}`).origin);
}

export const env = {
  ...values,
  COOKIE_SAME_SITE: values.COOKIE_SAME_SITE
    || (values.NODE_ENV === 'production' ? 'none' : 'lax'),
  CLIENT_ORIGINS: clientOrigins,
};
