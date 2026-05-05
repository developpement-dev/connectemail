-- ConnectMail — Schéma SQL Phase 5 (UUID Optimized)

-- Activer les extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ───────────────────────────────────────────────────────────────
-- Mise à jour TABLE : users
-- ───────────────────────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username_changed_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status                  VARCHAR(30)  NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'banned', 'suspended', 'scheduled_deletion', 'deleted')),
  ADD COLUMN IF NOT EXISTS scheduled_deletion_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS oauth_google_id         VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS oauth_facebook_id       VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW();

-- ───────────────────────────────────────────────────────────────
-- TABLE : user_profiles
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id      UUID          PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio          VARCHAR(160),
  location     VARCHAR(60),
  avatar_url   TEXT,
  cover_url    TEXT,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Trigger : créer automatiquement un profil vide à l'inscription
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id) VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_user_profile ON users;
CREATE TRIGGER trg_create_user_profile
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- ───────────────────────────────────────────────────────────────
-- TABLE : user_settings
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  user_id              UUID          PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  messages_privacy     VARCHAR(20)   NOT NULL DEFAULT 'everyone'
    CHECK (messages_privacy IN ('everyone', 'nobody')),
  show_online_status   BOOLEAN       NOT NULL DEFAULT TRUE,
  find_by_email        BOOLEAN       NOT NULL DEFAULT TRUE,
  notif_new_messages   BOOLEAN       NOT NULL DEFAULT TRUE,
  notif_daily_digest   BOOLEAN       NOT NULL DEFAULT FALSE,
  two_fa_enabled       BOOLEAN       NOT NULL DEFAULT FALSE,
  two_fa_secret        VARCHAR(64),
  two_fa_backup_codes  TEXT[],
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Trigger : créer les settings par défaut
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id) VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_user_settings ON users;
CREATE TRIGGER trg_create_user_settings
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_user_settings();

-- ───────────────────────────────────────────────────────────────
-- TABLE : blocked_users
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blocked_users (
  blocker_id   UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id   UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- ───────────────────────────────────────────────────────────────
-- TABLE : reports
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id             SERIAL        PRIMARY KEY,
  reporter_id    UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_id    UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason         VARCHAR(30)   NOT NULL
    CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'fake')),
  comment        VARCHAR(500),
  priority       VARCHAR(10)   NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('normal', 'high', 'urgent')),
  status         VARCHAR(20)   NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  resolved_by    UUID          REFERENCES users(id) ON DELETE SET NULL,
  resolved_at    TIMESTAMPTZ,
  admin_note     TEXT,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (reporter_id, reported_id)
);

-- ───────────────────────────────────────────────────────────────
-- TABLE : bans
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bans (
  id           SERIAL        PRIMARY KEY,
  user_id      UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  banned_by    UUID          REFERENCES users(id) ON DELETE SET NULL,
  reason       TEXT          NOT NULL,
  ban_type     VARCHAR(20)   NOT NULL DEFAULT 'temporary'
    CHECK (ban_type IN ('temporary', 'permanent')),
  expires_at   TIMESTAMPTZ,
  lifted_at    TIMESTAMPTZ,
  lifted_by    UUID          REFERENCES users(id) ON DELETE SET NULL,
  lift_note    TEXT,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- INDEX & SEARCH
-- ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON users(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_users_fullname_trgm
  ON users USING GIN (
    (LOWER(COALESCE(first_name,'') || ' ' || COALESCE(last_name,''))) gin_trgm_ops
  );

-- ───────────────────────────────────────────────────────────────
-- FONCTION : Suppression totale des données d'un compte
-- ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION delete_user_data(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM blocked_users WHERE blocker_id = p_user_id OR blocked_id = p_user_id;
  DELETE FROM reports WHERE reporter_id = p_user_id;
  DELETE FROM user_profiles WHERE user_id = p_user_id;
  DELETE FROM user_settings WHERE user_id = p_user_id;
  
  UPDATE users SET
    status = 'deleted',
    email = 'deleted_' || p_user_id || '@connectmail.invalid',
    first_name = '[Supprimé]',
    last_name = '',
    password_hash = '',
    scheduled_deletion_at = NULL,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;
