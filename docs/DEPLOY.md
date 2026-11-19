# Running and publishing Faahem

Faahem runs in two modes:

- **Local-only** (no `DATABASE_URL`): no accounts; each learner's progress lives in their browser.
- **With accounts** (`DATABASE_URL` set): learners sign up with email and password, and progress syncs
  across devices. The server merges every device's copy, so nothing is lost when two devices disagree.

## Development with accounts

1. Start Docker Desktop.
2. `npm run db:up` starts Postgres 17 on `127.0.0.1:5544` (data kept in the `faahem-db` volume).
3. `cp .env.example .env.local` (already done on the main dev machine).
4. `npm run db:migrate` applies `db/schema.sql` (safe to rerun).
5. `npm run dev`, then open `/account`.
6. `BASE_URL=http://localhost:3000 npm run test:api` checks sign-up, login, logout and sync end to end.

## Publishing: option A, Vercel + managed Postgres

1. Push the repository to GitHub.
2. Create a Postgres database (Neon, Supabase or Vercel Postgres) and copy its connection string.
3. Run the schema once against it: `DATABASE_URL=<url> node scripts/migrate.mjs`.
4. Import the repository in Vercel and set the `DATABASE_URL` environment variable.
5. Deploy. Check `/api/health` returns `{"ok":true,"db":"up"}`.

## Publishing: option B, your own server with Docker

1. Copy the repository to the server.
2. Create `.env` next to `docker-compose.yml` with a strong `POSTGRES_PASSWORD=...`.
3. `docker compose --profile app up -d --build` builds the image, starts Postgres and the site on port 3000;
   the container applies the schema on every start.
4. Put a reverse proxy with HTTPS (Caddy or Nginx) in front of port 3000. Session cookies are marked
   `Secure` in production, so the site must be served over HTTPS.

## Security notes

- Passwords are hashed with scrypt and a random salt; only a SHA-256 of each session token is stored.
- Sessions last 30 days in an `httpOnly`, `SameSite=Lax` cookie.
- Login is limited to 10 failed attempts per IP and email per 15 minutes (in memory, so per server instance).
- Not built yet: email verification and password reset (both need an email provider).
