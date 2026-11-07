CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 100),
  email VARCHAR(255) NOT NULL UNIQUE CHECK (email = lower(email)),
  password_hash TEXT NOT NULL CHECK (length(password_hash) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
