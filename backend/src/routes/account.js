// backend/src/routes/account.js
import express from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import { requireAuth } from '../auth/auth.middleware.js';
import db from '../utils/db.js';

const router = express.Router();

router.delete('/',
    requireAuth,
    [body('password').notEmpty()],
    async (req, res) => {
        const meId = req.user.id;
        const { password } = req.body;

        try {
            const { rows } = await db.query('SELECT password_hash FROM users WHERE id = $1', [meId]);
            if (!rows.length) return res.status(404).json({ error: 'Compte introuvable' });

            const valid = await bcrypt.compare(password, rows[0].password_hash);
            if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect' });

            // Mark for deletion
            await db.query(`
        UPDATE users SET
          status = 'scheduled_deletion',
          scheduled_deletion_at = NOW() + INTERVAL '30 days',
          updated_at = NOW()
        WHERE id = $1
      `, [meId]);

            res.json({ message: 'Votre compte sera supprimé dans 30 jours.' });
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
);

export default router;