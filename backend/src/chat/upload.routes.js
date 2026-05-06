// backend/src/chat/upload.routes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../auth/auth.middleware.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Dossier de stockage local (dans le conteneur backend)
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Types de fichiers acceptés
const ALLOWED_TYPES = {
    // Images
    'image/jpeg':       'image',
    'image/jpg':        'image',
    'image/png':        'image',
    'image/gif':        'image',
    'image/webp':       'image',
    // Vidéos
    'video/mp4':        'video',
    'video/webm':       'video',
    'video/ogg':        'video',
    'video/quicktime':  'video',
    // Audio
    'audio/webm':       'audio',
    'audio/ogg':        'audio',
    'audio/mpeg':       'audio',
    'audio/mp3':        'audio',
    'audio/wav':        'audio',
    'audio/mp4':        'audio',
    // Documents
    'application/pdf':                                                          'document',
    'application/msword':                                                       'document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':  'document',
    'application/vnd.ms-excel':                                                 'document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':        'document',
    'application/vnd.ms-powerpoint':                                            'document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':'document',
    'application/zip':                                                          'document',
    'application/x-zip-compressed':                                             'document',
    'text/plain':                                                               'document',
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, uuidv4() + ext);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter: (req, file, cb) => {
        if (ALLOWED_TYPES[file.mimetype]) {
            cb(null, true);
        } else {
            cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`));
        }
    },
});

// POST /api/upload  (monté sur /api dans server.js)
router.post('/', requireAuth, (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('[Upload Error]', err.message);
            return res.status(400).json({ error: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier reçu.' });
        }

        const fileType = ALLOWED_TYPES[req.file.mimetype] || 'document';
        const fileUrl  = `/public/uploads/${req.file.filename}`;

        res.json({
            file_url:  fileUrl,
            file_type: fileType,
            file_name: req.file.originalname,
            file_size: req.file.size,
        });
    });
});

export default router;
