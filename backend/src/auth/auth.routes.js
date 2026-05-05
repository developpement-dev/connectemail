// backend/src/auth/auth.routes.js
import express from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import * as authController from './auth.controller.js';
import { requireAuth } from './auth.middleware.js';

import multer from 'multer';

const router = express.Router();
const upload = multer(); // Utilise le stockage en mémoire par défaut

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Trop de comptes créés depuis cette IP.' },
});

const registerValidators = [
  body('firstName').trim().notEmpty().withMessage('Prénom requis').isLength({ max: 50 }),
  body('lastName').trim().notEmpty().withMessage('Nom requis').isLength({ max: 50 }),
  body('username').trim().notEmpty().matches(/^[a-zA-Z0-9_]{3,30}$/),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
];

// On ajoute 'upload.single('avatar')' AVANT les validateurs pour peupler req.body
router.post('/register', registerLimiter, upload.single('avatar'), registerValidators, authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/logout', requireAuth, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);
router.get('/check-username/:username', authController.checkUsername);
router.get('/me', requireAuth, authController.getMe);

export default router;
