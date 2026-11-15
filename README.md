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
    styles/
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

## Two-computer setup: Ubuntu PostgreSQL, Windows app

Yes—the PostgreSQL server can be on your friend's Ubuntu laptop while you run the React frontend and Node/Express backend on your Windows laptop. In that arrangement, **the backend on Windows connects to PostgreSQL on Ubuntu**. `localhost` in a database URL means the computer running the backend, not your friend's computer, so do not use `localhost:5432` to reach Ubuntu directly.

Recommended development layout:

```text
Your Windows laptop                         Friend's Ubuntu laptop
React/Vite :5173 -> Express API :5000  ->    PostgreSQL :5432
                                      SSH tunnel
```

Use the SSH tunnel instructions below if possible. They keep PostgreSQL bound to the Ubuntu machine and encrypt the database connection. Do not expose port 5432 to the public internet or configure your router to forward it.

### Prerequisites

On **your Windows laptop**:

- Node.js 18 or newer (LTS recommended), which includes npm.
- Git, if you are downloading/cloning the project with Git.
- Windows OpenSSH Client (available in current Windows versions; test with `ssh -V` in PowerShell).
- Network/VPN access to your friend's Ubuntu laptop.

On **your friend's Ubuntu laptop**:

- PostgreSQL 13 or newer and its command-line client (`psql`).
- OpenSSH server for the recommended tunnel.
- A Linux login account for you to use over SSH, if your friend agrees.
- A PostgreSQL database role dedicated to this app. Do not use the PostgreSQL `postgres` superuser from the app.
- The laptop must stay powered on, connected to the same trusted network/VPN, and awake while you use the database.

### 1. Install PostgreSQL and SSH on Ubuntu

On your friend's Ubuntu laptop, open a terminal and run:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib openssh-server
sudo systemctl enable --now postgresql
sudo systemctl enable --now ssh
sudo systemctl status postgresql
```

The Ubuntu firewall/router must allow SSH (port 22) from your trusted network or VPN. Only your friend or administrator should change firewall settings. PostgreSQL itself should remain inaccessible from the public internet.

### 2. Create the app database and restricted SQL user

On Ubuntu, open PostgreSQL's admin console:

```bash
sudo -u postgres psql
```

At the `postgres=#` prompt, create a separate app login and database (do not run these commands inside your application):

```sql
CREATE ROLE modszone_app LOGIN
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
```

Set a strong, unique password without putting it into shell history:

```text
\password modszone_app
```

`psql` prompts you to enter and confirm the password. Next create the database owned by that app role:

```sql
CREATE DATABASE modszone OWNER modszone_app;
\connect modszone
GRANT USAGE, CREATE ON SCHEMA public TO modszone_app;
\quit
```

The project migration creates the `users` table and migration tracking table inside this database. Do **not** manually create tables, add fake users, or drop/reset the database. If the database already exists, do not run `CREATE DATABASE` again—ask its owner to verify the app role's database/schema permissions instead.

### 3. Open an SSH tunnel from Windows

Find your friend's Ubuntu laptop's private LAN/VPN IP address. Your friend can check Ubuntu's local addresses with:

```bash
hostname -I
```

Use the IP reachable from your Windows laptop (for example `192.168.1.25` on the same home Wi-Fi). In a **separate PowerShell window on Windows**, start this tunnel and leave that window open:

```powershell
ssh -N -L 5433:127.0.0.1:5432 ubuntu_user@FRIEND_UBUNTU_IP
```

Replace `ubuntu_user` with your friend's Ubuntu login name and `FRIEND_UBUNTU_IP` with the reachable IP. Accept the SSH host key only after confirming it with your friend. The first connection may prompt for the Ubuntu account password or an SSH key. This command makes the remote PostgreSQL port available to programs on your Windows laptop as `127.0.0.1:5433`; it does not make PostgreSQL public.

If SSH reports a timeout, first check both laptops are on the same trusted LAN/VPN, the Ubuntu IP is correct, the SSH service is running, and the Ubuntu firewall allows SSH from your laptop. Do not solve this by opening PostgreSQL to the whole internet.

### 4. Configure the app on Windows

In PowerShell, go to the project root (the directory containing the root `package.json`) and install the app dependencies:

```powershell
cd C:\path\to\modzone-main
npm install
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

Edit `backend/.env` with a text editor. Set the database URL to the local end of the SSH tunnel and use the password created for `modszone_app`:

```dotenv
DATABASE_URL=postgresql://modszone_app:YOUR_DATABASE_PASSWORD@127.0.0.1:5433/modszone
DB_SSL=false
```

`DB_SSL=false` is appropriate for this local SSH tunnel: SSH encrypts the connection. For a direct private-LAN database connection without a tunnel, protect that connection with PostgreSQL TLS or a trusted VPN; do not assume an unencrypted LAN connection is safe. If the database password contains URL-reserved characters (for example `@`, `:`, `/`, `#`, or `%`), percent-encode those characters in `DATABASE_URL`, or choose a strong password that avoids them.

Also set a private JWT secret of at least 32 characters and keep the development origins:

```dotenv
JWT_SECRET=replace_this_with_a_unique_random_secret_of_32_characters_or_more
CLIENT_URL=http://localhost:5173
```

You can generate a random JWT secret in PowerShell with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

The frontend uses the same-origin `/api` path by default. Vite proxies this path to `http://localhost:5000` during local development. The database URL, database password, and JWT secret belong **only** in `backend/.env`; never put them in the frontend or upload `.env` files.

To test the frontend from another device on the local network, add its exact origin to `ADDITIONAL_CLIENT_ORIGINS` in `backend/.env`, for example `ADDITIONAL_CLIENT_ORIGINS=http://192.168.1.25:5173`, then restart the backend. Use the actual IP and port shown in the browser, and do not set this option in production.

### 5. Create the tables and start the application

Keep the SSH tunnel terminal open. In a second PowerShell window, from the project root run:

```powershell
npm run migrate
npm run dev
```

`npm run migrate` connects to your friend's PostgreSQL through the tunnel and applies `backend/src/migrations/001_create_users.sql` once. It creates the tables; it does not create the PostgreSQL server, database, or app role. `npm run dev` starts both the backend (`http://localhost:5000`) and frontend (normally `http://localhost:5173`). Visit the Vite URL, create an account, and test login.

If you close the SSH tunnel window, PostgreSQL connections stop working. Start the tunnel again before running migrations or using the backend.

### Direct private-LAN connection (alternative)

Use this only on a trusted LAN/VPN, not across the public internet. The Ubuntu administrator must configure PostgreSQL `listen_addresses`, add a narrow `pg_hba.conf` rule allowing only your Windows laptop's private IP to connect to database `modszone` as `modszone_app` using `scram-sha-256`, and allow TCP port 5432 through Ubuntu's firewall only from that same IP. Restart PostgreSQL after changing its configuration. In `backend/.env`, use:

```dotenv
DATABASE_URL=postgresql://modszone_app:YOUR_DATABASE_PASSWORD@FRIEND_UBUNTU_IP:5432/modszone
```

Do not use `listen_addresses='*'`, `0.0.0.0/0` in `pg_hba.conf`, a public firewall rule for port 5432, or router port forwarding. The SSH tunnel is simpler and safer for development.

### Troubleshooting database connection errors

- **Connection refused / timeout:** Start PostgreSQL and the SSH tunnel; check that SSH connects to the correct Ubuntu IP and that port `5433` on Windows is the tunnel target.
- **Password authentication failed:** Check the role name and reset its password on Ubuntu with `sudo -u postgres psql` then `\password modszone_app`.
- **Database does not exist:** Ask the database owner to verify `modszone` was created.
- **Permission denied for schema public:** Have the database owner run `GRANT USAGE, CREATE ON SCHEMA public TO modszone_app;` while connected to `modszone`.
- **Invalid environment configuration:** Confirm `backend/.env` exists, `DATABASE_URL` is a valid URL, and `JWT_SECRET` is at least 32 characters.

## Production and code-sharing checklist

- Never upload `backend/.env`, passwords, JWT secrets, SSH private keys, or database backups to GitHub. `.env` files are ignored by `.gitignore`; commit only the `.env.example` templates.
- Do not use the database admin/superuser account in `DATABASE_URL`.
- Do not expose the Ubuntu PostgreSQL port to the public internet. Use the SSH tunnel/VPN for development; for an actual public website, use a properly secured hosted PostgreSQL service or deploy the backend in a secured network with PostgreSQL.
- Before sharing/pushing, check `git status` and confirm no `.env` file or secret is staged.
- The example GitHub game-file repository is public redirect mode; its URLs are not private downloads.

For production split-origin deployments, set `CLIENT_URL` to the exact HTTPS frontend origin and `COOKIE_SAME_SITE=none`. Production cookies are always Secure. Use HTTPS for both the frontend and API.

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

The server's `src/config/games.js` is the canonical game and repository-folder configuration. The frontend catalogue filters out Valorant, Minecraft, and Among Us; the remaining games link to their matching game detail page. Public game-list responses do not disclose the folder URLs. When a visitor requests a game's DLL folder, the frontend requests the protected access endpoint; only after the backend verifies the HTTP-only cookie does it return the configured GitHub folder link.

This redirect mode is suitable only when the GitHub repository is public. To keep files private, implement a server-side download/proxy flow using a backend-only GitHub credential and enforce permissions and file limits. Never put a GitHub token in `frontend/.env` or browser code.

## Game downloads

Each game detail page has two download options. The DLL option uses the authenticated `/api/games/:slug/access` endpoint and opens the returned repository folder. The cheat-table option uses the authenticated `/api/games/:slug/cheat-table` endpoint to retrieve the configured URL from `backend/private-config/cheat-table-links.json`, then redirects the browser to MediaFire. Games without a configured MediaFire link remain unavailable.

The app does not have verified per-game cheat descriptions yet, so game pages explicitly say when cheat details have not been provided rather than inventing them.

## Production deployment

For the included Vercel multi-service configuration, set environment variables in **Vercel Project Settings → Environment Variables**; uploading a local `.env` file does not configure the deployed services. Set `VITE_API_URL` to `/api`, then redeploy. Set these backend variables in the Vercel project:

- `DATABASE_URL`: the Neon connection string, stored only as a backend environment variable. Do not commit the real URL or password.
- `DB_SSL=true` for the Neon database connection.
- `JWT_SECRET`: a unique secret of at least 32 characters.
- `CLIENT_URL=https://modzon-73qn.vercel.app`: the exact production frontend origin. The CORS and state-changing request checks both compare against this origin; do not add a trailing path or allow every origin.
- Enable **Access to System Environment Variables** in Vercel. The backend also accepts Vercel's exact `VERCEL_PROJECT_PRODUCTION_URL`, so the production domain remains allowed without opening CORS to all Vercel sites.
- `COOKIE_SAME_SITE=none` for cross-site HTTPS deployments; the included same-domain Vercel routing can use the default policy.
- `GITHUB_OWNER=Mouli372`, `GITHUB_REPO=MODSZONE-GAME-FILES`, and `GITHUB_BRANCH=main` for DLL links. These are separate from the app source repository, `Mouli933/modzon`.

After changing environment variables, redeploy the Vercel project. Run `npm run migrate` against the production database once before users sign up. Verify `https://modzon-73qn.vercel.app/api/health` and `https://modzon-73qn.vercel.app/api/games`. Never put database credentials or `JWT_SECRET` in a `VITE_*` variable or expose them to the frontend.

No deployment is performed by this project setup.
