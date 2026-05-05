// backend/src/middlewares/checknotblocked.js
import db from '../utils/db.js';

export default async function checkNotBlocked(req, res, next) {
    const senderId = req.user.id;

    try {
        let recipientId = req.params.id || req.body.recipientId;

        if (!recipientId && req.body.conversationId) {
            const { rows } = await db.query(`
        SELECT user_id FROM user_conversations
        WHERE conversation_id = $1 AND user_id != $2
        LIMIT 1
      `, [req.body.conversationId, senderId]);

            if (!rows.length) return res.status(404).json({ error: 'Conversation introuvable' });
            recipientId = rows[0].user_id;
        }

        if (!recipientId) return next();

        const { rows: blocks } = await db.query(`
      SELECT blocker_id, blocked_id FROM blocked_users
      WHERE (blocker_id = $1 AND blocked_id = $2)
         OR (blocker_id = $2 AND blocked_id = $1)
      LIMIT 1
    `, [senderId, recipientId]);

        if (blocks.length) {
            return res.status(403).json({ error: 'Vous ne pouvez pas envoyer de message à cet utilisateur.' });
        }

        next();
    } catch (err) {
        console.error('[checkNotBlocked]', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}