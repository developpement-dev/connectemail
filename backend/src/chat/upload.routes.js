// backend/src/chat/upload.routes.js
import express from 'express';
import multer from 'multer';
// import sharp from 'sharp';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../auth/auth.middleware.js';
// import { uploadToS3 } from '../services/storage.js';

const router = express.Router();

const S3_URL = process.env.S3_PUBLIC_URL || '';
const uploadToS3 = async (key, buffer, mimetype) => {
    console.log(`[Mock S3] Uploading ${key}`);
    return `${S3_URL}/${key}`;
};

const ALLOWED_TYPES = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu.' });

  try {
    const fileId = uuidv4();
    const ext = path.extname(req.file.originalname).toLowerCase();
    const s3Key = `uploads/${req.user.id}/${fileId}${ext}`;

    await uploadToS3(s3Key, req.file.buffer, req.file.mimetype);
    const fileUrl = `${S3_URL}/${s3Key}`;

    res.json({
      file_url: fileUrl,
      file_type: ALLOWED_TYPES[req.file.mimetype],
      file_name: req.file.originalname,
      file_size: req.file.size,
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de l'upload." });
  }
});

export default router;
