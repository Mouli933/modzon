import app from './app.js';
import { env } from './config/env.js';
import { pool } from './config/database.js';

const server = app.listen(env.PORT, () => {
  console.log(`MODS'ZONE API listening on port ${env.PORT}`);
});

async function shutDown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);
