CREATE TABLE community_posts (
  id UUID PRIMARY KEY,
  owner_hash TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('comment','experience','suggestion')),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  mode TEXT NOT NULL CHECK (mode IN ('bike','car','brt','pool')),
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 500),
  origin TEXT CHECK (length(origin) <= 150),
  destination TEXT CHECK (length(destination) <= 150),
  departed_at TIMESTAMPTZ,
  duration_minutes INTEGER CHECK (duration_minutes BETWEEN 1 AND 1440),
  congestion TEXT CHECK (congestion IN ('low','moderate','heavy','standstill')),
  training_consent BOOLEAN NOT NULL DEFAULT FALSE,
  schema_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX community_posts_created_idx ON community_posts (created_at DESC, id);
CREATE INDEX community_posts_training_idx ON community_posts (departed_at, mode) WHERE training_consent = TRUE AND type = 'experience';
