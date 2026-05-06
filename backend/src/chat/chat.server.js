// backend/src/chat/chat.server.js
import express from 'express';
import db from '../utils/db.js';
import { requireAuth } from '../auth/auth.middleware.js';

export function setupChatSocket(io) {
    const onlineUsers = new Map();

    io.on('connection', (socket) => {
        const userId = socket.userId;
        if (!userId) return;

        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
            io.emit('user:online', { userId });
        }
        onlineUsers.get(userId).add(socket.id);

        socket.join(`user:${userId}`);

        socket.on('join:conversation', async ({ conversationId }) => {
            socket.join(`conv:${conversationId}`);
        });

        socket.on('disconnect', () => {
            const userSockets = onlineUsers.get(userId);
            if (userSockets) {
                userSockets.delete(socket.id);
                if (userSockets.size === 0) {
                    onlineUsers.delete(userId);
                    io.emit('user:offline', { userId });
                }
            }
        });
    });

    return { onlineUsers };
}

export const chatRouter = (io, onlineUsers) => {
    const router = express.Router();

    // --- CONVERSATIONS ---
    router.get('/conversations', requireAuth, async (req, res) => {
        try {
            const result = await db.query(
                `SELECT c.id, c.last_message_at, uc.unread_count, u.id as "other_user_id", u.username, u.first_name, u.last_name, u.avatar_url,
                 (
                    SELECT row_to_json(msg)
                    FROM (
                        SELECT id, sender_id, content, status, created_at
                        FROM messages
                        WHERE conversation_id = c.id
                        ORDER BY created_at DESC
                        LIMIT 1
                    ) msg
                 ) as last_message
                 FROM conversations c
                 JOIN user_conversations uc ON uc.conversation_id = c.id AND uc.user_id = $1
                 JOIN user_conversations uc2 ON uc2.conversation_id = c.id AND uc2.user_id != $1
                 JOIN users u ON u.id = uc2.user_id
                 ORDER BY c.last_message_at DESC NULLS LAST`,
                [req.user.id]
            );
            
            const conversations = result.rows.map(row => ({
                id: row.id,
                last_message_at: row.last_message_at,
                unread_count: row.unread_count,
                other_user: {
                    id: row.other_user_id,
                    username: row.username,
                    first_name: row.first_name,
                    last_name: row.last_name,
                    avatar_url: row.avatar_url,
                    is_online: onlineUsers ? onlineUsers.has(row.other_user_id) : false
                },
                last_message: row.last_message
            }));
            res.json(conversations);
        } catch (err) {
            console.error('[GET /conversations]', err);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    });

    router.post('/conversations', requireAuth, async (req, res) => {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId requis' });
        if (userId === req.user.id) return res.status(400).json({ error: 'Impossible de discuter avec soi-même' });

        try {
            // Check if conversation already exists
            const existing = await db.query(
                `SELECT c.id FROM conversations c
                 JOIN user_conversations uc1 ON c.id = uc1.conversation_id AND uc1.user_id = $1
                 JOIN user_conversations uc2 ON c.id = uc2.conversation_id AND uc2.user_id = $2
                 LIMIT 1`,
                [req.user.id, userId]
            );

            if (existing.rows.length > 0) {
                return res.json({ id: existing.rows[0].id });
            }

            // Create new conversation
            await db.query('BEGIN');
            const conv = await db.query('INSERT INTO conversations DEFAULT VALUES RETURNING id');
            const convId = conv.rows[0].id;

            await db.query(
                'INSERT INTO user_conversations (user_id, conversation_id) VALUES ($1, $2), ($3, $2)',
                [req.user.id, convId, userId]
            );
            await db.query('COMMIT');

            res.status(201).json({ id: convId });
        } catch (err) {
            await db.query('ROLLBACK');
            console.error('[POST /conversations]', err);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    });

    router.get('/conversations/:id/messages', requireAuth, async (req, res) => {
        const convId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 30;
        const offset = (page - 1) * limit;

        try {
            // Verify access
            const check = await db.query('SELECT 1 FROM user_conversations WHERE user_id = $1 AND conversation_id = $2', [req.user.id, convId]);
            if (!check.rows.length) return res.status(403).json({ error: 'Accès refusé' });

            const result = await db.query(
                `SELECT id, sender_id, content, status, created_at,
                 (
                    SELECT json_agg(row_to_json(att))
                    FROM (
                        SELECT id, file_name, file_url, file_type, file_size
                        FROM attachments
                        WHERE message_id = messages.id
                    ) att
                 ) as attachments
                 FROM messages
                 WHERE conversation_id = $1
                 ORDER BY created_at DESC
                 LIMIT $2 OFFSET $3`,
                [convId, limit, offset]
            );

            // Mark as read inside user_conversations
            await db.query('UPDATE user_conversations SET unread_count = 0 WHERE user_id = $1 AND conversation_id = $2', [req.user.id, convId]);

            res.json({ messages: result.rows });
        } catch (err) {
            console.error('[GET /messages]', err);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    });

    router.post('/messages', requireAuth, async (req, res) => {
        const { conversationId, content, attachments } = req.body;
        if (!conversationId || (!content && (!attachments || attachments.length === 0))) {
            return res.status(400).json({ error: 'Données invalides' });
        }

        try {
            // Verify access
            const check = await db.query('SELECT 1 FROM user_conversations WHERE user_id = $1 AND conversation_id = $2', [req.user.id, conversationId]);
            if (!check.rows.length) return res.status(403).json({ error: 'Accès refusé' });

            // Create message
            const msgResult = await db.query(
                'INSERT INTO messages (conversation_id, sender_id, content, status) VALUES ($1, $2, $3, $4) RETURNING id, conversation_id, sender_id, content, status, created_at',
                [conversationId, req.user.id, content || '', 'sent']
            );
            const msg = msgResult.rows[0];

            // Save attachments in DB
            msg.attachments = [];
            if (attachments && attachments.length > 0) {
                for (const att of attachments) {
                    const attResult = await db.query(
                        `INSERT INTO attachments (message_id, file_name, file_url, file_type, file_size, thumbnail_url, duration)
                         VALUES ($1, $2, $3, $4, $5, $6, $7)
                         RETURNING id, file_name, file_url, file_type, file_size, thumbnail_url, duration`,
                        [
                            msg.id,
                            att.file_name || 'fichier',
                            att.file_url,
                            att.file_type || 'document',
                            att.file_size || 0,
                            att.thumbnail_url || null,
                            att.duration || null
                        ]
                    );
                    msg.attachments.push(attResult.rows[0]);
                }
            }

            await db.query('UPDATE conversations SET last_message_at = NOW() WHERE id = $1', [conversationId]);
            await db.query('UPDATE user_conversations SET unread_count = unread_count + 1 WHERE conversation_id = $1 AND user_id != $2', [conversationId, req.user.id]);

            // Real-time broadcast
            const participantsResult = await db.query('SELECT user_id FROM user_conversations WHERE conversation_id = $1', [conversationId]);
            participantsResult.rows.forEach(row => {
                io.to(`user:${row.user_id}`).emit('message:new', msg);
            });
            io.to(`conv:${conversationId}`).emit('message:new', msg);

            res.status(201).json(msg);
        } catch (err) {
            console.error('[POST /messages]', err);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    });

    return router;
};
