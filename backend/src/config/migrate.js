import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pool } from './database.js';

const migrationsDirectory = fileURLToPath(new URL('../migrations/', import.meta.url));

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        run_on TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const files = (await readdir(migrationsDirectory))
      .filter((name) => name.endsWith('.sql'))
      .sort();

    for (const name of files) {
      const applied = await client.query(
        'SELECT 1 FROM schema_migrations WHERE name = $1',
        [name],
      );
      if (applied.rowCount > 0) {
        continue;
      }

      const sql = await readFile(path.join(migrationsDirectory, name), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
      console.log(`Applied migration: ${name}`);
    }

    console.log('Database migrations are up to date.');
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((error) => {
  console.error(
    'Database migration failed. Check DATABASE_URL and migration files.',
    error.name,
    error.code || '',
  );
  process.exitCode = 1;
});
