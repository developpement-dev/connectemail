-- ConnectMail Schema Phase 5 (UUID version)

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio VARCHAR(160),
    location VARCHAR(60),
    avatar_url TEXT,
    cover_url TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    messages_privacy VARCHAR(20) DEFAULT 'everyone',
    show_online_status BOOLEAN DEFAULT TRUE,
    find_by_email BOOLEAN DEFAULT TRUE,
    notif_new_messages BOOLEAN DEFAULT TRUE,
    notif_daily_digest BOOLEAN DEFAULT FALSE,
    two_fa_enabled BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Blocked Users Table
CREATE TABLE IF NOT EXISTS blocked_users (
    blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id)
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reported_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(20) NOT NULL,
    comment TEXT,
    priority VARCHAR(10) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (reporter_id, reported_id)
);

-- User Sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    last_active TIMESTAMP DEFAULT NOW()
);

-- Refresh Tokens (If not using UUID as primary key for internal tracking, but user_id as foreign key)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_blocked_users_target ON blocked_users(blocked_id);

-- Chat Tables (Phase 4/5 additions)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    last_message_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_conversations (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    unread_count INT DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, conversation_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    status VARCHAR(20) DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT DEFAULT 0,
    thumbnail_url TEXT,
    duration FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);
