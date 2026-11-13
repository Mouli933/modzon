import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, test } from 'node:test';
import jwt from 'jsonwebtoken';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://localhost:5432/modszone';
process.env.JWT_SECRET = 'test-only-secret-that-is-at-least-thirty-two-characters';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.VERCEL_PROJECT_PRODUCTION_URL = 'modzon-73qn.vercel.app';
process.env.GITHUB_OWNER = 'Mouli372';
process.env.GITHUB_REPO = 'MODSZONE-GAME-FILES';
process.env.GITHUB_BRANCH = 'main';
const cheatTableLinks = JSON.parse(
  readFileSync(new URL('../private-config/cheat-table-links.json', import.meta.url), 'utf8'),
);

const { default: app } = await import('../src/app.js');
const { pool } = await import('../src/config/database.js');
const { signupSchema } = await import('../src/validators/auth.validator.js');
const { getGameAccessBySlug, listPublicGames } = await import('../src/services/game.service.js');
const { AUTH_COOKIE_NAME, clearAuthCookie, setAuthCookie } = await import('../src/utils/cookies.js');
let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test('authenticated cheat-table requests return every configured MediaFire link', async () => {
  const originalQuery = pool.query;
  pool.query = async () => ({
    rowCount: 1,
    rows: [{ id: 'test-user', name: 'Test User', email: 'test@example.com' }],
  });

  try {
    const token = jwt.sign({ sub: 'test-user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    for (const [slug, url] of Object.entries(cheatTableLinks)) {
      const response = await fetch(`${baseUrl}/api/games/${slug}/cheat-table`, {
        headers: { Cookie: `${AUTH_COOKIE_NAME}=${token}` },
      });
      const payload = await response.json();

      if (url === 'MEDIAFIRE_URL') {
        assert.equal(response.status, 404, `${slug} should remain unavailable`);
        continue;
      }

      assert.equal(response.status, 200, `${slug} should expose its configured link`);
      assert.equal(payload.url, url, `${slug} should return its configured link`);
    }
  } finally {
    pool.query = originalQuery;
  }
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await pool.end();
});

test('health endpoint responds without a database connection', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).success, true);
});

test('public games endpoint lists all 15 games without repository URLs', async () => {
  const response = await fetch(`${baseUrl}/api/games`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.games.length, 15);
  assert.deepEqual(payload.games[0], {
    id: 1,
    slug: 'gta-v',
    name: 'GTA V',
    title: 'GTA V MOD',
  });
  assert.ok(payload.games.every((game) => !('url' in game) && !('githubUrl' in game)));
});

test('game access configuration maps every slug to its GitHub folder', () => {
  const games = listPublicGames();
  assert.equal(games.length, 15);
  assert.equal(
    getGameAccessBySlug('assassins-creed-black-flag').url,
    'https://github.com/Mouli372/MODSZONE-GAME-FILES/tree/main/assassins-creed-black-flag',
  );
  assert.equal(
    getGameAccessBySlug('resident-evil-requiem').url,
    'https://github.com/Mouli372/MODSZONE-GAME-FILES/tree/main/resident-evil-requiem',
  );
  assert.equal(getGameAccessBySlug('minecraft').url.endsWith('/minecraft'), true);
});

test('all 12 catalogue games map to their own GitHub folder', () => {
  const excludedSlugs = new Set(['valorant', 'minecraft', 'among-us']);
  const catalogueGames = listPublicGames().filter((game) => !excludedSlugs.has(game.slug));

  assert.equal(catalogueGames.length, 12);
  for (const game of catalogueGames) {
    const url = new URL(getGameAccessBySlug(game.slug).url);
    assert.equal(url.pathname.endsWith(`/${game.slug}`), true, `${game.name} folder mapping`);
  }
});

test('signup validation normalizes email and enforces matching strong passwords', () => {
  const valid = signupSchema.parse({
    name: ' Example User ',
    email: ' USER@Example.COM ',
    password: 'ExamplePassword123',
    confirmPassword: 'ExamplePassword123',
  });
  assert.equal(valid.name, 'Example User');
  assert.equal(valid.email, 'user@example.com');
  assert.equal(signupSchema.safeParse({ ...valid, confirmPassword: 'DifferentPassword123' }).success, false);
});

test('authentication cookies are HTTP-only and cleared with matching policy', () => {
  let setCookie;
  let clearedCookie;
  const response = {
    cookie: (...args) => { setCookie = args; },
    clearCookie: (...args) => { clearedCookie = args; },
  };

  setAuthCookie(response, 'test-token');
  clearAuthCookie(response);

  assert.equal(setCookie[0], AUTH_COOKIE_NAME);
  assert.equal(setCookie[1], 'test-token');
  assert.equal(setCookie[2].httpOnly, true);
  assert.equal(setCookie[2].sameSite, 'lax');
  assert.equal(setCookie[2].maxAge, 24 * 60 * 60 * 1000);
  assert.equal(clearedCookie[0], AUTH_COOKIE_NAME);
  assert.equal(clearedCookie[1].httpOnly, true);
  assert.equal(clearedCookie[1].sameSite, 'lax');
});

test('game access requires an authenticated cookie', async () => {
  const response = await fetch(`${baseUrl}/api/games/gta-v/access`);
  assert.equal(response.status, 401);
  assert.match((await response.json()).message, /log in/i);
});

test('cheat-table downloads require an authenticated cookie', async () => {
  const response = await fetch(`${baseUrl}/api/games/gta-v/cheat-table`);
  assert.equal(response.status, 401);
  assert.match((await response.json()).message, /log in/i);
});

test('Resident Evil Requiem cheat-table download requires authentication', async () => {
  const response = await fetch(`${baseUrl}/api/games/resident-evil-requiem/cheat-table`);
  assert.equal(response.status, 401);
  assert.match((await response.json()).message, /log in/i);
});

test('authenticated game access returns the configured game folder', async () => {
  const originalQuery = pool.query;
  pool.query = async () => ({
    rowCount: 1,
    rows: [{ id: 'test-user', name: 'Test User', email: 'test@example.com' }],
  });

  try {
    const token = jwt.sign({ sub: 'test-user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const response = await fetch(`${baseUrl}/api/games/gta-v/access`, {
      headers: { Cookie: `${AUTH_COOKIE_NAME}=${token}` },
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.url, 'https://github.com/Mouli372/MODSZONE-GAME-FILES/tree/main/gta-v');
  } finally {
    pool.query = originalQuery;
  }
});

test('authenticated Resident Evil Requiem access returns its protected GitHub folder', async () => {
  const unauthenticatedResponse = await fetch(`${baseUrl}/api/games/resident-evil-requiem/access`);
  assert.equal(unauthenticatedResponse.status, 401);

  const originalQuery = pool.query;
  pool.query = async () => ({
    rowCount: 1,
    rows: [{ id: 'test-user', name: 'Test User', email: 'test@example.com' }],
  });

  try {
    const token = jwt.sign({ sub: 'test-user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const response = await fetch(`${baseUrl}/api/games/resident-evil-requiem/access`, {
      headers: { Cookie: `${AUTH_COOKIE_NAME}=${token}` },
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(
      payload.url,
      'https://github.com/Mouli372/MODSZONE-GAME-FILES/tree/main/resident-evil-requiem',
    );
  } finally {
    pool.query = originalQuery;
  }
});

test('cheat-table route validates slugs before looking up links', async () => {
  const response = await fetch(`${baseUrl}/api/games/not_a_slug/cheat-table`);
  assert.equal(response.status, 400);
});

test('invalid game slugs and unknown games return client errors', async () => {
  const invalidSlug = await fetch(`${baseUrl}/api/games/not_a_slug`);
  const unknownGame = await fetch(`${baseUrl}/api/games/not-a-game`);
  const unknownGameAccess = await fetch(`${baseUrl}/api/games/not-a-game/access`);

  assert.equal(invalidSlug.status, 400);
  assert.equal(unknownGame.status, 404);
  assert.equal(unknownGameAccess.status, 404);
});

test('signup rejects mismatched or weak passwords before database access', async () => {
  const response = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'http://localhost:5173',
    },
    body: JSON.stringify({
      name: 'Example User',
      email: 'user@example.com',
      password: 'short',
      confirmPassword: 'different',
    }),
  });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).success, false);
});

test('state-changing requests reject untrusted origins', async () => {
  const response = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { Origin: 'https://untrusted.example' },
  });
  assert.equal(response.status, 403);
});

test('state-changing requests require an origin and accept the configured frontend', async () => {
  const missingOrigin = await fetch(`${baseUrl}/api/auth/logout`, { method: 'POST' });
  const allowedOrigin = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { Origin: 'http://localhost:5173' },
  });

  assert.equal(missingOrigin.status, 403);
  assert.equal(allowedOrigin.status, 200);
  assert.match(allowedOrigin.headers.get('set-cookie'), /HttpOnly/i);
});

test('state-changing requests accept the exact Vercel production origin', async () => {
  const response = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { Origin: 'https://modzon-73qn.vercel.app' },
  });

  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get('access-control-allow-origin'),
    'https://modzon-73qn.vercel.app',
  );
});
