import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.DB_SSL ? { rejectUnauthorized: true } : undefined,
});

pool.on('error', () => {
  console.error('Unexpected error from an idle PostgreSQL client.');
});
