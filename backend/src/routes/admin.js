// backend/src/routes/admin.js
import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { requireAdmin } from '../auth/auth.middleware.js';

const router = express.Router();

// Stats
router.get('/stats', requireAdmin, adminController.getStats);

// User Management
router.get('/users', requireAdmin, adminController.getUsers);
router.post('/users/:id/ban', requireAdmin, adminController.banUser);
router.post('/users/:id/unban', requireAdmin, adminController.unbanUser);

// Reports
router.get('/reports', requireAdmin, adminController.getReports);
router.put('/reports/:id', requireAdmin, adminController.resolveReport);
router.get('/logs', requireAdmin, adminController.getLogs);

export default router;


