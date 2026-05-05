// backend/src/routes/settings.js
import express from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../auth/auth.middleware.js';
import db from '../utils/db.js';

const router = express.Router();

router.put('/privacy',
    requireAuth,
    [
        body('messagesPrivacy').isIn(['everyone', 'nobody']).withMessage('Valeur invalide'),
        body('showOnlineStatus').isBoolean(),
        body('findByEmail').isBoolean()
    ],
    async (req, res) => {
        const { messagesPrivacy, showOnlineStatus, findByEmail } = req.body;
        try {
            await db.query(`
        UPDATE user_settings SET
          messages_privacy    = $1,
          show_online_status  = $2,
          find_by_email       = $3,
          updated_at          = NOW()
        WHERE user_id = $4
      `, [messagesPrivacy, showOnlineStatus, findByEmail, req.user.id]);

            res.json({ message: 'Confidentialité mise à jour' });
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
);

router.put('/notifications',
    requireAuth,
    [
        body('newMessages').isBoolean(),
        body('dailyDigest').isBoolean()
    ],
    async (req, res) => {
        const { newMessages, dailyDigest } = req.body;
        try {
            await db.query(`
        UPDATE user_settings SET
          notif_new_messages = $1,
          notif_daily_digest = $2,
          updated_at         = NOW()
        WHERE user_id = $3
      `, [newMessages, dailyDigest, req.user.id]);

            res.json({ message: 'Notifications mises à jour' });
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
);

router.get('/', requireAuth, async (req, res) => {
    try {
        const { rows } = await db.query(`
      SELECT
        us.messages_privacy,
        us.show_online_status,
        us.find_by_email,
        us.notif_new_messages,
        us.notif_daily_digest,
        us.two_fa_enabled,
        u.email,
        u.username,
        u.first_name,
        u.last_name,
        u.username_changed_at,
        up.bio,
        up.location,
        up.avatar_url,
        up.cover_url
      FROM user_settings us
      JOIN users u ON u.id = us.user_id
      LEFT JOIN user_profiles up ON up.user_id = us.user_id
      WHERE us.user_id = $1
    `, [req.user.id]);

        if (!rows.length) return res.status(404).json({ error: 'Paramètres introuvables' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
