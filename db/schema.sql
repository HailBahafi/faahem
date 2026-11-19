-- Faahem database schema. Idempotent: `npm run db:migrate` applies it on every deploy.

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL,
  name          text NOT NULL,
  password_hash text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users (lower(email));

-- Only a SHA-256 of each session token is stored, so a database leak cannot be replayed as a login.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash text PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);

-- One JSON document per learner: the same shape the browser keeps in localStorage.
CREATE TABLE IF NOT EXISTS progress (
  user_id    uuid PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  data       jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
