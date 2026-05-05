// backend/src/routes/users.js
import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import * as usersController from '../controllers/users.controller.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ── Profil public
router.get('/search',              requireAuth, usersController.searchUsers);
router.get('/:username',           requireAuth, usersController.getProfile);

// ── Actions sociales
router.post('/:id/block',          requireAuth, usersController.blockUser);
router.delete('/:id/block',        requireAuth, usersController.unblockUser);
router.post('/:id/report',         requireAuth, usersController.reportUser);

// ── Mon profil
router.put('/me/profile',          requireAuth, usersController.updateProfile);
router.post('/me/avatar',          requireAuth, upload.single('avatar'),  usersController.uploadAvatar);
router.post('/me/banner',          requireAuth, upload.single('banner'),  usersController.uploadBanner);
router.get('/me/blocked',          requireAuth, usersController.getBlockedUsers);

export default router;
