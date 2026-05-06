// backend/src/auth/auth.middleware.js
import jwt from 'jsonwebtoken';
import db from '../utils/db.js';


export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token d\'accès manquant.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Be flexible with sub/id depending on how it's stored
    req.user = { id: payload.sub || payload.id };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
};

export const requireAdmin = async (req, res, next) => {
  requireAuth(req, res, async () => {
    try {
      const { rows } = await db.query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
      if (!rows.length || !rows[0].is_admin) {
        return res.status(403).json({ error: 'Accès refusé. Administrateur requis.' });
      }
      req.user.isAdmin = true;
      next();
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  });
};

