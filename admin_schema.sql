-- ConnectMail Admin Schema

-- Audit Logs for Admin Actions
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'ban_user', 'delete_user', 'resolve_report', etc.
    target_type VARCHAR(50),      -- 'user', 'report', 'message'
    target_id TEXT,               -- ID of the target object
    details JSONB,                -- Before/After values or reasons
    ip_address INET,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexing for search
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON admin_audit_logs(created_at DESC);
