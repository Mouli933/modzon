# MODS'ZONE

MODS'ZONE is a React + Vite frontend backed by a separate Express/Node API and PostgreSQL database. The site keeps the existing dark/neon design and uses an HTTP-only cookie for login sessions. Backend authentication is required before the API returns a game's GitHub folder URL.

> The initial game repository mode is **public GitHub redirect**. Public GitHub repositories can still be accessed directly by anyone; MODS'ZONE login does not make public files private.

## Architecture

- `frontend/` — React 18, Vite, React Router, CSS, and static artwork.
- `backend/` — Express API, PostgreSQL access, validation, cookie authentication, and migrations.
- PostgreSQL — user records and password hashes. Passwords are never stored as plain text.

The original React source, public images, and legacy static pages were backed up before migration. Legacy pages such as COD and PUBG remain available under `frontend/public/legacy/`.

## Project layout

```text
frontend/
  public/                 Existing images and legacy pages
  src/
    components/
    context/
    pages/
    services/
    App.jsx
    main.jsx
    styles.css
  .env.example
  package.json
  vite.config.js
backend/
  src/
    config/               Environment, database pool, games, migration runner
    controllers/
    middleware/
    migrations/
    routes/
    services/
    utils/
    validators/
    app.js
    server.js
  .env.example
  package.json
README.md
```

## Requirements

- Node.js 18 or newer and npm.
- PostgreSQL 13 or newer.

Create a PostgreSQL database named `modszone` (or use another database name):

```sql
CREATE DATABASE modszone;
```

On Windows, you can run that SQL in pgAdmin's Query Tool or `psql`. Keep the database username and password private; they belong only in the backend environment file.

## Configure the environment

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `DATABASE_URL` to your PostgreSQL connection string, for example:

   ```text
   postgresql://postgres:your_password@localhost:5432/modszone
   ```

3. Replace `JWT_SECRET` with a randomly generated secret of at least 32 characters. Do not commit `backend/.env`.
4. Keep `DB_SSL=false` for local PostgreSQL. Set it to `true` for a hosted PostgreSQL service that requires TLS; certificate verification remains enabled.
5. Copy `frontend/.env.example` to `frontend/.env`. The default API URL works for local development.
6. Configure `GITHUB_OWNER`, `GITHUB_REPO`, and `GITHUB_BRANCH` for the public game-files repository.

For split-origin production deployments, set `CLIENT_URL` to the exact HTTPS frontend origin and set `COOKIE_SAME_SITE=none`. Production cookies are always Secure. Use HTTPS for both the frontend and API. The API only accepts the configured frontend origin and checks request origins on state-changing methods.

## Install, migrate, and run

From the project root, install all workspace dependencies:

```powershell
npm install
```

Copy the example environment files and configure PostgreSQL and the JWT secret as described above. Then, from the project root, apply the database migration and start both development servers:

```powershell
npm run migrate
npm run dev
```

The migration runner creates `schema_migrations`, applies unapplied SQL files once, and never resets existing data. The API starts at `http://localhost:5000`; open the Vite URL printed in the terminal (normally `http://localhost:5173`). The frontend and backend can also be started separately with `npm run dev:frontend` and `npm run dev:backend`.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | API health check |
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/login` | Verify credentials and set the HTTP-only auth cookie |
| POST | `/api/auth/logout` | Clear the auth cookie |
| GET | `/api/auth/me` | Return the current authenticated user |
| GET | `/api/users/profile` | Return the authenticated profile |
| GET | `/api/games` | List public game names and slugs (no repository URLs) |
| GET | `/api/games/:slug` | Return public game details |
| GET | `/api/games/:slug/access` | Require login and return that game's GitHub URL |

Signup expects `name`, `email`, `password`, and `confirmPassword`. Passwords must be at least 12 characters and include an uppercase letter, a lowercase letter, and a number. Login failures return the same generic invalid-credentials message for unknown emails and incorrect passwords.

The browser stores no password or token in localStorage. Authentication requests include cookies; the frontend checks `/api/auth/me` at startup so a valid cookie survives page refresh.

## GitHub game access

The server's `src/config/games.js` is the canonical list of all 14 games and their repository folders. Public game-list responses do not disclose the folder URLs. When a visitor selects a game, the frontend requests the protected access endpoint; only after the backend verifies the cookie does it return the configured GitHub folder link.

This redirect mode is suitable only when the GitHub repository is public. To keep files private, implement a server-side download/proxy flow using a backend-only GitHub credential and enforce permissions and file limits. Never put a GitHub token in `frontend/.env` or browser code.

## Production deployment

Deploy the frontend and backend separately (for example, Vercel/Netlify and Render) and provision PostgreSQL (for example, Neon or Render PostgreSQL). Configure the same environment variables in the backend hosting dashboard; do not upload `.env` files.

1. Build the frontend with `npm run build` from `frontend/` and publish `frontend/dist`.
2. Set the backend start command to `npm start` from `backend/`.
3. Run `npm run migrate` from `backend/` as a release/deploy step after configuring the production database.
4. Set the production `DATABASE_URL`, `DB_SSL=true` as required, a strong `JWT_SECRET`, exact `CLIENT_URL`, and `COOKIE_SAME_SITE=none` for cross-site HTTPS deployment.
5. Set the GitHub repository environment variables for the target repository and verify `/api/health`.

No deployment is performed by this project setup.
