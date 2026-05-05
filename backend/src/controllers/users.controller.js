// backend/src/controllers/users.controller.js
import pool from '../utils/db.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Helper : sauvegarder image localement (sans S3) ──────────────
// En production, remplacer par uploadToS3
async function saveImageLocally(buffer, subfolder, ext = '.jpg') {
  const uploadsDir = path.join(__dirname, '../../../frontend/uploads', subfolder);
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const filename = uuidv4() + ext;
  fs.writeFileSync(path.join(uploadsDir, filename), buffer);
  return `/uploads/${subfolder}/${filename}`;
}

// ── GET /api/users/search?q=...&page=... ─────────────────────────
export const searchUsers = async (req, res) => {
  const { q = '', page = 1 } = req.query;
  const limit  = 20;
  const offset = (parseInt(page) - 1) * limit;

  if (q.trim().length < 2) {
    return res.json({ users: [], total: 0, page: 1 });
  }

  try {
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.username, u.avatar_url,
              u.bio, u.last_seen_at,
              EXISTS(SELECT 1 FROM blocked_users
                     WHERE blocker_id = $1 AND blocked_id = u.id) AS is_blocked_by_me
       FROM users u
       WHERE u.is_banned = false
         AND u.is_verified = true
         AND u.id != $1
         -- Exclure les utilisateurs bloqués dans les deux sens
         AND NOT EXISTS (
           SELECT 1 FROM blocked_users
           WHERE (blocker_id = $1 AND blocked_id = u.id)
              OR (blocker_id = u.id AND blocked_id = $1)
         )
         AND (
           u.first_name ILIKE $2 OR
           u.last_name  ILIKE $2 OR
           u.username   ILIKE $2 OR
           CONCAT(u.first_name, ' ', u.last_name) ILIKE $2
         )
       ORDER BY
         CASE WHEN u.username ILIKE $3 THEN 0
              WHEN u.first_name ILIKE $3 THEN 1
              ELSE 2 END,
         u.last_seen_at DESC NULLS LAST
       LIMIT $4 OFFSET $5`,
      [req.user.id, `%${q}%`, `${q}%`, limit, offset]
    );

    const total = await pool.query(
      `SELECT COUNT(*) FROM users u
       WHERE u.is_banned = false AND u.is_verified = true AND u.id != $1
         AND NOT EXISTS (
           SELECT 1 FROM blocked_users
           WHERE (blocker_id = $1 AND blocked_id = u.id)
              OR (blocker_id = u.id AND blocked_id = $1)
         )
         AND (u.first_name ILIKE $2 OR u.last_name ILIKE $2 OR u.username ILIKE $2)`,
      [req.user.id, `%${q}%`]
    );

    res.json({
      users: result.rows,
      total: parseInt(total.rows[0].count),
      page: parseInt(page),
    });
  } catch (err) {
    console.error('[searchUsers]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// ── GET /api/users/:username ──────────────────────────────────────
export const getProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const result = await pool.query(
      `SELECT
         u.id, u.first_name, u.last_name, u.username,
         u.avatar_url, u.banner_url, u.bio, u.location,
         u.created_at, u.last_seen_at,
         -- Paramètres de confidentialité
         COALESCE(s.show_online_status, true)    AS show_online_status,
         COALESCE(s.who_can_message, 'everyone') AS who_can_message,
         -- Est-ce que le visiteur a bloqué cet user ?
         EXISTS(SELECT 1 FROM blocked_users
                WHERE blocker_id = $2 AND blocked_id = u.id) AS is_blocked_by_me,
         -- Est-ce que cet user a bloqué le visiteur ?
         EXISTS(SELECT 1 FROM blocked_users
                WHERE blocker_id = u.id AND blocked_id = $2) AS has_blocked_me
       FROM users u
       LEFT JOIN user_settings s ON s.user_id = u.id
       WHERE u.username = $1 AND u.is_banned = false`,
      [username.toLowerCase(), req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    const user = result.rows[0];

    // Si bloqué dans les deux sens → profil restreint
    if (user.has_blocked_me) {
      return res.json({
        id:           user.id,
        first_name:   user.first_name,
        last_name:    user.last_name,
        username:     user.username,
        avatar_url:   null,
        has_blocked_me: true,
      });
    }

    // Masquer le statut en ligne si l'utilisateur a désactivé
    const isOnline = user.show_online_status
      ? (user.last_seen_at && (Date.now() - new Date(user.last_seen_at) < 5 * 60 * 1000))
      : null;

    res.json({ ...user, is_online: isOnline });
  } catch (err) {
    console.error('[getProfile]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// ── POST /api/users/:id/block ─────────────────────────────────────
export const blockUser = async (req, res) => {
  const { id: targetId } = req.params;
  if (targetId === req.user.id) {
    return res.status(400).json({ error: 'Vous ne pouvez pas vous bloquer vous-même.' });
  }

  try {
    // Insérer le blocage (ON CONFLICT DO NOTHING si déjà bloqué)
    await pool.query(
      `INSERT INTO blocked_users (blocker_id, blocked_id, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT DO NOTHING`,
      [req.user.id, targetId]
    );

    // Archiver la conversation entre les deux utilisateurs
    await pool.query(
      `UPDATE user_conversations uc
       SET is_archived = true
       WHERE conversation_id IN (
         SELECT c.id FROM conversations c
         JOIN user_conversations uc1 ON uc1.conversation_id = c.id AND uc1.user_id = $1
         JOIN user_conversations uc2 ON uc2.conversation_id = c.id AND uc2.user_id = $2
       )`,
      [req.user.id, targetId]
    );

    res.json({ success: true, message: 'Utilisateur bloqué.' });
  } catch (err) {
    console.error('[blockUser]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// ── DELETE /api/users/:id/block ───────────────────────────────────
export const unblockUser = async (req, res) => {
  const { id: targetId } = req.params;

  try {
    await pool.query(
      `DELETE FROM blocked_users WHERE blocker_id = $1 AND blocked_id = $2`,
      [req.user.id, targetId]
    );

    // Désarchiver la conversation
    await pool.query(
      `UPDATE user_conversations uc
       SET is_archived = false
       WHERE user_id = $1
         AND conversation_id IN (
           SELECT c.id FROM conversations c
           JOIN user_conversations uc2 ON uc2.conversation_id = c.id AND uc2.user_id = $2
         )`,
      [req.user.id, targetId]
    );

    res.json({ success: true, message: 'Utilisateur débloqué.' });
  } catch (err) {
    console.error('[unblockUser]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// ── POST /api/users/:id/report ────────────────────────────────────
export const reportUser = async (req, res) => {
  const { id: reportedId } = req.params;
  const { reason, comment } = req.body;

  const VALID_REASONS = ['spam','harassment','inappropriate','fake_profile','other'];
  if (!VALID_REASONS.includes(reason)) {
    return res.status(400).json({ error: 'Motif invalide.' });
  }

  try {
    await pool.query(
      `INSERT INTO reports (id, reporter_id, reported_id, reason, comment, status, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'pending', NOW())
       ON CONFLICT (reporter_id, reported_id) DO UPDATE
         SET reason = EXCLUDED.reason,
             comment = EXCLUDED.comment,
             created_at = NOW()`,
      [req.user.id, reportedId, reason, comment || null]
    );

    res.json({ success: true, message: 'Signalement envoyé.' });
  } catch (err) {
    console.error('[reportUser]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// ── PUT /api/users/me/profile ─────────────────────────────────────
export const updateProfile = async (req, res) => {
  const { firstName, lastName, bio, location } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET first_name = COALESCE(NULLIF($1,''), first_name),
           last_name  = COALESCE(NULLIF($2,''), last_name),
           bio        = $3,
           location   = $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, first_name, last_name, username, bio, location, avatar_url, banner_url`,
      [firstName, lastName, bio || null, location || null, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[updateProfile]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// ── POST /api/users/me/avatar ─────────────────────────────────────
export const uploadAvatar = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu.' });

  try {
    const ext = path.extname(req.file.originalname) || '.jpg';
    const url = await saveImageLocally(req.file.buffer, 'avatars', ext);

    await pool.query(
      'UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2',
      [url, req.user.id]
    );

    res.json({ avatar_url: url });
  } catch (err) {
    console.error('[uploadAvatar]', err);
    res.status(500).json({ error: 'Erreur lors de l\'upload.' });
  }
};

// ── POST /api/users/me/banner ─────────────────────────────────────
export const uploadBanner = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu.' });

  try {
    const ext = path.extname(req.file.originalname) || '.jpg';
    const url = await saveImageLocally(req.file.buffer, 'banners', ext);

    await pool.query(
      'UPDATE users SET banner_url = $1, updated_at = NOW() WHERE id = $2',
      [url, req.user.id]
    );

    res.json({ banner_url: url });
  } catch (err) {
    console.error('[uploadBanner]', err);
    res.status(500).json({ error: 'Erreur lors de l\'upload.' });
  }
};

// ── GET /api/users/me/blocked ─────────────────────────────────────
export const getBlockedUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.username, u.avatar_url,
              b.created_at AS blocked_at
       FROM blocked_users b
       JOIN users u ON u.id = b.blocked_id
       WHERE b.blocker_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('[getBlockedUsers]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};
