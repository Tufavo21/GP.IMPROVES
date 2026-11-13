-- Esquema D1 de 2con2estudio. Aplicar con:
--   npx wrangler d1 execute 2con2estudio-leads --file=worker/schema.sql --config worker/wrangler.toml [--remote]
-- Solo se guarda lo necesario para responder y recordar. NO se guardan fotos ni IP en claro.

CREATE TABLE IF NOT EXISTS leads (
  id          TEXT PRIMARY KEY,                 -- UUID
  created_at  TEXT NOT NULL,                    -- ISO 8601 UTC
  lang        TEXT NOT NULL CHECK (lang IN ('es', 'en')),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT NOT NULL,
  reform_type TEXT NOT NULL,                    -- integral | cocina | bano | interiorismo | otra
  finishes    TEXT NOT NULL,                    -- estandar | medio | alto
  area_m2     REAL NOT NULL,
  message     TEXT NOT NULL,
  consent_at  TEXT NOT NULL,                    -- momento en que marcó el consentimiento
  status      TEXT NOT NULL DEFAULT 'new'
              CHECK (status IN ('new', 'booked', 'reminded1', 'reminded2', 'unsubscribed')),
  status_at   TEXT NOT NULL,
  reminded1_at TEXT,
  reminded2_at TEXT,
  is_demo     INTEGER NOT NULL DEFAULT 0        -- 1 si se recibió con DEMO_MODE=true
);
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads (status, created_at);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);

-- Límite por IP. `key` es un hash (HMAC) de la IP, nunca la IP.
CREATE TABLE IF NOT EXISTS rate_limits (
  key    TEXT NOT NULL,
  bucket INTEGER NOT NULL,
  count  INTEGER NOT NULL,
  PRIMARY KEY (key, bucket)
);
