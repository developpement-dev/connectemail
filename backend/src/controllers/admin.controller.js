// backend/src/controllers/admin.controller.js
import db from '../utils/db.js';

// Helper for audit logs
const logAdminAction = async (adminId, action, targetType, targetId, details = {}, req) => {
    try {
        await db.query(
            `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, ip_address)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [adminId, action, targetType, targetId, JSON.stringify(details), req.ip]
        );
    } catch (err) {
        console.error('[logAdminAction] Error:', err);
    }
};

export const getStats = async (req, res) => {
    try {
        // Users
        const usersCount = await db.query('SELECT COUNT(*) FROM users');
        const activeToday = await db.query('SELECT COUNT(*) FROM users WHERE last_seen_at > NOW() - INTERVAL \'24 hours\'');
        const bannedCount = await db.query('SELECT COUNT(*) FROM users WHERE status = \'banned\'');

        // Reports
        const pendingReports = await db.query('SELECT COUNT(*) FROM reports WHERE status = \'pending\'');

        // Storage (Mocked for now as we need S3/Local metrics)
        const storageUsed = '4.2 GB';

        res.json({
            totalUsers: parseInt(usersCount.rows[0].count),
            activeToday: parseInt(activeToday.rows[0].count),
            bannedCount: parseInt(bannedCount.rows[0].count),
            pendingReports: parseInt(pendingReports.rows[0].count),
            storageUsed
        });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

export const getUsers = async (req, res) => {
    try {
        const { status, q, page = 1 } = req.query;
        const limit = 20;
        const offset = (page - 1) * limit;

        const where = [];
        const params = [];
        let i = 1;

        if (status && status !== 'all') {
            where.push(`status = $${i++}`);
            params.push(status);
        }
        if (q) {
            where.push(`(username ILIKE $${i} OR email ILIKE $${i})`);
            params.push(`%${q}%`);
            i++;
        }

        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
        
        const result = await db.query(
            `SELECT id, username, email, first_name, last_name, status, created_at, last_seen_at, is_admin
             FROM users
             ${whereClause}
             ORDER BY created_at DESC
             LIMIT $${i++} OFFSET $${i++}`,
            [...params, limit, offset]
        );

        res.json({ users: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

export const banUser = async (req, res) => {
    const { id } = req.params;
    const { reason, banType, expiresAt } = req.body;

    try {
        await db.query(
            'UPDATE users SET status = \'banned\' WHERE id = $1',
            [id]
        );

        await db.query(
            'INSERT INTO bans (user_id, banned_by, reason, ban_type, expires_at) VALUES ($1, $2, $3, $4, $5)',
            [id, req.user.id, reason, banType || 'permanent', expiresAt || null]
        );

        await logAdminAction(req.user.id, 'ban_user', 'user', id, { reason, banType }, req);

        res.json({ message: 'Utilisateur banni avec succès.' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

export const unbanUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE users SET status = \'active\' WHERE id = $1', [id]);
        await db.query('UPDATE bans SET lifted_at = NOW(), lifted_by = $1 WHERE user_id = $2 AND lifted_at IS NULL', [req.user.id, id]);
        
        await logAdminAction(req.user.id, 'unban_user', 'user', id, {}, req);

        res.json({ message: 'Utilisateur débanni.' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

export const getReports = async (req, res) => {

    try {
        const result = await db.query(
            `SELECT r.*, 
                    u1.username as reporter_username, u1.avatar_url as reporter_avatar,
                    u2.username as reported_username, u2.avatar_url as reported_avatar
             FROM reports r
             JOIN users u1 ON u1.id = r.reporter_id
             JOIN users u2 ON u2.id = r.reported_id
             ORDER BY 
                CASE WHEN r.priority = 'urgent' THEN 1 
                     WHEN r.priority = 'high' THEN 2 
                     ELSE 3 END,
                r.created_at DESC`
        );
        res.json({ reports: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

export const resolveReport = async (req, res) => {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    try {
        await db.query(
            'UPDATE reports SET status = $1, admin_note = $2, resolved_by = $3, resolved_at = NOW() WHERE id = $4',
            [status, adminNote, req.user.id, id]
        );

        await logAdminAction(req.user.id, 'resolve_report', 'report', id, { status, adminNote }, req);

        res.json({ message: 'Signalement traité.' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

export const getLogs = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const limit = 50;
        const offset = (page - 1) * limit;

        const result = await db.query(
            `SELECT l.*, u.username as admin_username
             FROM admin_audit_logs l
             LEFT JOIN users u ON u.id = l.admin_id
             ORDER BY l.created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        res.json({ logs: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};


