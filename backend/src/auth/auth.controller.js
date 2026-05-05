// backend/src/auth/auth.controller.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { validationResult } from 'express-validator';
import db from '../utils/db.js';
// import redis from '../redis.js'; // Assuming it's ESM or compatible

const SALT_ROUNDS = 12;

function generateAccessToken(userId) {
  return jwt.sign({ sub: userId, type: 'access' }, process.env.JWT_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(userId) {
  return jwt.sign({ sub: userId, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { firstName, lastName, username, email, password } = req.body;

  try {
    const exists = await db.query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username.toLowerCase()]);
    if (exists.rows.length > 0) return res.status(409).json({ error: 'Email ou nom d\'utilisateur déjà utilisé.' });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await db.query(
      `INSERT INTO users (first_name, last_name, username, email, password_hash, created_at)
       VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING id`,
      [firstName, lastName, username.toLowerCase(), email, passwordHash]
    );

    return res.status(201).json({ message: 'Compte créé !', userId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT id, password_hash, status FROM users WHERE email = $1', [email]);
    if (!result.rows.length) return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });

    const user = result.rows[0];
    if (user.status === 'banned') return res.status(403).json({ error: 'Compte suspendu.' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, path: '/api/auth/refresh-token' });
    return res.json({ accessToken, user: { id: user.id } });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

export const logout = async (req, res) => {
    res.clearCookie('refreshToken', { path: '/api/auth/refresh-token' });
    return res.json({ message: 'Déconnexion réussie.' });
};

export const refreshToken = async (req, res) => {
    // Basic implementation
    res.status(501).json({ error: 'Not implemented' });
};

export const forgotPassword = async (req, res) => {
    res.status(501).json({ error: 'Not implemented' });
};

export const resetPassword = async (req, res) => {
    res.status(501).json({ error: 'Not implemented' });
};

export const verifyEmail = async (req, res) => {
    res.status(501).json({ error: 'Not implemented' });
};

export const checkUsername = async (req, res) => {
    const { username } = req.params;
    try {
        const result = await db.query('SELECT id FROM users WHERE username = $1', [username.toLowerCase()]);
        return res.json({ available: result.rows.length === 0 });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

export const getMe = async (req, res) => {
    try {
        const result = await db.query('SELECT id, username, email FROM users WHERE id = $1', [req.user.id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};
