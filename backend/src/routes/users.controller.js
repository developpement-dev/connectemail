// ─────────────────────────────────────────────
//  ConnectMail — Users Controller (Phase 5)
// ─────────────────────────────────────────────
import bcrypt from 'bcrypt';
import sharp from 'sharp';
import db from '../utils/db.js';
import { uploadToS3 } from '../services/storage.js';
import redis from '../redis.js';

const S3_URL = process.env.S3_PUBLIC_URL || '';

// ── GET /api/users/:username ──────────────────
export const getProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const viewerId = req.user.id;

        const result = await db.query(
            `SELECT
         u.id, u.first_name, u.last_name, u.username, u.bio, u.location,
         u.avatar_url, u.banner_url, u.created_at, u.last_seen_at,
         u.username_changed_at,
         s.show_online_status,
         s.who_can_message,
         EXISTS(SELECT 1 FROM blocked_users WHERE blocker_id=$1 AND blocked_id=u.id) AS is_blocked_by_me,
         EXISTS(SELECT 1 FROM blocked_users WHERE blocker_id=u.id AND blocked_id=$1) AS has_blocked_me
       FROM users u
       LEFT JOIN user_settings s ON s.user_id = u.id
       WHERE u.username = $2 AND u.is_banned = false`,
            [viewerId, username.toLowerCase()]
        );

        if (!result.rows.length) return res.status(404).json({ error: 'Utilisateur introuvable.' });

        const u = result.rows[0];

        // Masquer le statut en ligne si désactivé
        const isOnline = u.show_online_status
            ? (Date.now() - new Date(u.last_seen_at).getTime()) < 5 * 60 * 1000
            : false;

        res.json({
            id: u.id,
            first_name: u.first_name,
            last_name: u.last_name,
            username: u.username,
            bio: u.bio,
            location: u.location,
            avatar_url: u.avatar_url,
            banner_url: u.banner_url,
            created_at: u.created_at,
            last_seen_at: u.show_online_status ? u.last_seen_at : null,
            username_changed_at: u.username_changed_at,
            is_online: isOnline,
            is_blocked_by_me: u.is_blocked_by_me,
            has_blocked_me: u.has_blocked_me,
            who_can_message: u.who_can_message,
        });
    } catch (err) {
        console.error('[getProfile]', err);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

// ── GET /api/users/me ─────────────────────────
export const getMe = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT u.id, u.first_name, u.last_name, u.username, u.email,
              u.bio, u.location, u.avatar_url, u.banner_url,
              u.created_at, u.last_seen_at, u.username_changed_at
       FROM users u WHERE u.id = $1`,
            [req.user.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Introuvable.' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

// ── PUT /api/users/me ─────────────────────────
export const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, username, bio, location } = req.body;
        const userId = req.user.id;

        // Vérifier changement username
        if (username) {
            const current = await db.query('SELECT username, username_changed_at FROM users WHERE id=$1', [userId]);
            if (current.rows[0].username !== username.toLowerCase()) {
                const lastChange = current.rows[0].username_changed_at;
                if (lastChange) {
                    const daysSince = (Date.now() - new Date(lastChange).getTime()) / (1000 * 60 * 60 * 24);
                    if (daysSince < 30) {
                        return res.status(400).json({ error: 'Username modifiable une fois tous les 30 jours.' });
                    }
                }
                // Vérifier disponibilité
                const taken = await db.query('SELECT id FROM users WHERE username=$1 AND id!=$2', [username.toLowerCase(), userId]);
                if (taken.rows.length) return res.status(409).json({ error: 'Ce nom d\'utilisateur est déjà pris.' });
            }
        }

        // Upload avatar
        let avatarUrl = undefined;
        if (req.files?.avatar?.[0]) {
            const file = req.files.avatar[0];
            const buf = await sharp(file.buffer).resize(400, 400, { fit: 'cover' }).jpeg({ quality: 85 }).toBuffer();
            const key = `avatars/${userId}.jpg`;
            await uploadToS3(key, buf, 'image/jpeg');
            avatarUrl = `${S3_URL}/${key}?t=${Date.now()}`;
        }

        // Upload banner
        let bannerUrl = undefined;
        if (req.files?.banner?.[0]) {
            const file = req.files.banner[0];
            const buf = await sharp(file.buffer).resize(1200, 300, { fit: 'cover' }).jpeg({ quality: 85 }).toBuffer();
            const key = `banners/${userId}.jpg`;
            await uploadToS3(key, buf, 'image/jpeg');
            bannerUrl = `${S3_URL}/${key}?t=${Date.now()}`;
        }

        const fields = [];
        const values = [];
        let i = 1;

        if (firstName) { fields.push(`first_name=$${i++}`); values.push(firstName.trim()); }
        if (lastName) { fields.push(`last_name=$${i++}`); values.push(lastName.trim()); }
        if (username) { fields.push(`username=$${i++}`); values.push(username.toLowerCase()); fields.push('username_changed_at=NOW()'); }
        if (bio !== undefined) { fields.push(`bio=$${i++}`); values.push(bio.substring(0, 160)); }
        if (location !== undefined) { fields.push(`location=$${i++}`); values.push(location.trim() || null); }
        if (avatarUrl) { fields.push(`avatar_url=$${i++}`); values.push(avatarUrl); }
        if (bannerUrl) { fields.push(`banner_url=$${i++}`); values.push(bannerUrl); }

        if (!fields.length) return res.json({ message: 'Rien à mettre à jour.' });

        values.push(userId);
        await db.query(`UPDATE users SET ${fields.join(',')} WHERE id=$${i}`, values);

        res.json({ message: 'Profil mis à jour.' });
    } catch (err) {
        console.error('[updateProfile]', err);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

// ── PUT /api/users/me/email ───────────────────
export const updateEmail = async (req, res) => {
    try {
        const { newEmail, password } = req.body;
        if (!newEmail || !password) return res.status(400).json({ error: 'Données manquantes.' });

        const user = await db.query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
        if (!await bcrypt.compare(password, user.rows[0].password_hash)) {
            return res.status(401).json({ error: 'Mot de passe incorrect.' });
        }

        const exists = await db.query('SELECT id FROM users WHERE email=$1 AND id!=$2', [newEmail, req.user.id]);
        if (exists.rows.length) return res.status(409).json({ error: 'Cet email est déjà utilisé.' });

        await db.query('UPDATE users SET email=$1, is_verified=false WHERE id=$2', [newEmail, req.user.id]);
        // TODO: envoyer email de vérification à newEmail
        res.json({ message: 'Email mis à jour. Vérifiez votre nouvelle adresse.' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

// ── PUT /api/users/me/password ────────────────
export const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Données manquantes.' });
        if (newPassword.length < 8) return res.status(400).json({ error: '8 caractères minimum.' });

        const user = await db.query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
        if (!await bcrypt.compare(oldPassword, user.rows[0].password_hash)) {
            return res.status(401).json({ error: 'Mot de passe actuel incorrect.' });
        }

        const hash = await bcrypt.hash(newPassword, 12);
        await db.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, req.user.id]);
        res.json({ message: 'Mot de passe modifié.' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

// ── GET /api/users/me/settings ────────────────
export const getSettings = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM user_settings WHERE user_id=$1', [req.user.id]);
        if (!result.rows.length) {
            await db.query('INSERT INTO user_settings (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [req.user.id]);
            return res.json({ who_can_message: 'everyone', show_online_status: true, allow_search_by_email: true, email_new_messages: true, email_daily_digest: false });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

// ── PUT /api/settings/privacy ─────────────────
export const updatePrivacySettings = async (req, res) => {
    try {
        const { who_can_message, show_online_status, allow_search_by_email } = req.body;
        await db.query(
            `INSERT INTO user_settings (user_id, who_can_message, show_online_status, allow_search_by_email)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id) DO UPDATE SET
         who_can_message=$2, show_online_status=$3, allow_search_by_email=$4, updated_at=NOW()`,
            [req.user.id, who_can_message || 'everyone', show_online_status !== false, allow_search_by_email !== false]
        );
        res.json({ message: 'Confidentialité mise à jour.' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

// ── PUT /api/settings/notifications ──────────
export const updateNotifSettings = async (req, res) => {
    try {
        const { email_new_messages, email_daily_digest } = req.body;
        await db.query(
            `INSERT INTO user_settings (user_id, email_new_messages, email_daily_digest)
       VALUES ($1,$2,$3)
       ON CONFLICT (user_id) DO UPDATE SET
         email_new_messages=$2, email_daily_digest=$3, updated_at=NOW()`,
            [req.user.id, email_new_messages !== false, email_daily_digest === true]
        );
        res.json({ message: 'Notifications mises à jour.' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

// ── POST /api/users/:id/block ─────────────────
export const blockUser = async (req, res) => {
    try {
        const { id: targetId } = req.params;
        if (targetId === req.user.id) return res.status(400).json({ error: 'Impossible de se bloquer soi-même.' });

        const exists = await db.query('SELECT id FROM users WHERE id=$1', [targetId]);
        if (!exists.rows.length) return res.status(404).json({ error: 'Utilisateur introuvable.' });

        await db.query(
            'INSERT INTO blocked_users (blocker_id, blocked_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
            [req.user.id, targetId]
        );

        // Archiver la conversation entre les deux
        await db.query(
            `UPDATE user_conversations uc
       SET is_archived = true
       FROM user_conversations uc2
       WHERE uc.conversation_id = uc2.conversation_id
         AND uc.user_id = $1 AND uc2.user_id = $2`,
            [req.user.id, targetId]
        );

        res.json({ message: 'Utilisateur bloqué.' });
    } catch (err) {
        console.error('[blockUser]', err);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

// ── DELETE /api/users/:id/block ───────────────
export const unblockUser = async (req, res) => {
    try {
        await db.query(
            'DELETE FROM blocked_users WHERE blocker_id=$1 AND blocked_id=$2',
            [req.user.id, req.params.id]
        );

        // Restaurer la conversation
        await db.query(
            `UPDATE user_conversations uc
       SET is_archived = false
       FROM user_conversations uc2
       WHERE uc.conversation_id = uc2.conversation_id
         AND uc.user_id = $1 AND uc2.user_id = $2`,
            [req.user.id, req.params.id]
        );

        res.json({ message: 'Utilisateur débloqué.' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

// ── GET /api/users/me/blocked ─────────────────
export const getBlockedUsers = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT u.id, u.first_name, u.last_name, u.username, u.avatar_url, b.created_at AS blocked_at
       FROM blocked_users b
       JOIN users u ON u.id = b.blocked_id
       WHERE b.blocker_id = $1
       ORDER BY b.created_at DESC`,
            [req.user.id]
        );
        res.json({ blocked: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

// ── POST /api/users/:id/report ────────────────
export const reportUser = async (req, res) => {
    try {
        const { id: reportedId } = req.params;
        const { reason, comment } = req.body;
        if (reportedId === req.user.id) return res.status(400).json({ error: 'Impossible de se signaler soi-même.' });

        await db.query(
            `INSERT INTO reports (reporter_id, reported_id, reason, comment)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (reporter_id, reported_id) DO UPDATE SET reason=$3, comment=$4, created_at=NOW()`,
            [req.user.id, reportedId, reason, comment || null]
        );
        res.json({ message: 'Signalement envoyé.' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

// ── GET /api/users/search ─────────────────────
export const searchUsers = async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        const page = parseInt(req.query.page || '1');
        const limit = 20;
        const offset = (page - 1) * limit;

        if (q.length < 2) return res.json({ users: [], total: 0 });

        const result = await db.query(
            `SELECT u.id, u.first_name, u.last_name, u.username, u.avatar_url, u.last_seen_at,
              s.show_online_status
       FROM users u
       LEFT JOIN user_settings s ON s.user_id = u.id
       WHERE u.is_verified = true
         AND u.is_banned   = false
         AND u.id != $1
         AND (u.first_name ILIKE $2 OR u.last_name ILIKE $2 OR u.username ILIKE $2
              OR CONCAT(u.first_name,' ',u.last_name) ILIKE $2)
         -- Exclure ceux qui ont bloqué ou sont bloqués
         AND NOT EXISTS (
           SELECT 1 FROM blocked_users
           WHERE (blocker_id=$1 AND blocked_id=u.id)
              OR (blocker_id=u.id AND blocked_id=$1)
         )
         -- Respecter la confidentialité
         AND (s.who_can_message IS NULL OR s.who_can_message = 'everyone')
       ORDER BY
         CASE WHEN u.username ILIKE $3 THEN 0
              WHEN u.username ILIKE $2 THEN 1
              ELSE 2 END,
         u.last_seen_at DESC NULLS LAST
       LIMIT $4 OFFSET $5`,
            [req.user.id, `%${q}%`, `${q}%`, limit, offset]
        );

        const total = await db.query(
            `SELECT COUNT(*) FROM users u
       LEFT JOIN user_settings s ON s.user_id = u.id
       WHERE u.is_verified=true AND u.is_banned=false AND u.id!=$1
         AND (u.first_name ILIKE $2 OR u.last_name ILIKE $2 OR u.username ILIKE $2)
         AND NOT EXISTS(SELECT 1 FROM blocked_users WHERE (blocker_id=$1 AND blocked_id=u.id) OR (blocker_id=u.id AND blocked_id=$1))`,
            [req.user.id, `%${q}%`]
        );

        const users = result.rows.map(u => ({
            ...u,
            is_online: u.show_online_status && u.last_seen_at
                ? (Date.now() - new Date(u.last_seen_at).getTime()) < 5 * 60 * 1000
                : false,
        }));

        res.json({ users, total: parseInt(total.rows[0].count), page, pages: Math.ceil(parseInt(total.rows[0].count) / limit) });
    } catch (err) {
        console.error('[searchUsers]', err);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

// ── DELETE /api/account ───────────────────────
export const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ error: 'Mot de passe requis.' });

        const user = await db.query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
        if (!await bcrypt.compare(password, user.rows[0].password_hash)) {
            return res.status(401).json({ error: 'Mot de passe incorrect.' });
        }

        // Soft delete : anonymiser les données personnelles
        await db.query(
            `UPDATE users SET
         email = CONCAT('deleted_', id, '@deleted.local'),
         username = CONCAT('deleted_', LEFT(id::text, 8)),
         first_name = 'Compte', last_name = 'Supprimé',
         password_hash = 'DELETED', avatar_url = NULL, banner_url = NULL,
         bio = NULL, is_verified = false, is_banned = true,
         updated_at = NOW()
       WHERE id = $1`,
            [req.user.id]
        );

        // Révoquer tous les tokens Redis
        await redis.del(`refresh:${req.user.id}`);

        res.json({ message: 'Compte supprimé.' });
    } catch (err) {
        console.error('[deleteAccount]', err);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};