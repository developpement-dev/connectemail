import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Routes
import authRoutes from './auth/auth.routes.js';
import userRoutes from './routes/users.js';
import settingsRoutes from './routes/settings.js';
import accountRoutes from './routes/account.js';
import adminRoutes from './routes/admin.js';

import jwt from 'jsonwebtoken';

import { setupChatSocket, chatRouter } from './chat/chat.server.js';
import uploadRoutes from './chat/upload.routes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.set('trust proxy', 1); // Nginx proxy
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Socket Auth Middleware
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = payload.sub || payload.id;
        next();
    } catch (err) {
        next(new Error('Unauthorized'));
    }
});

const { onlineUsers } = setupChatSocket(io);

// Middlewares
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "font-src": ["'self'", "https://fonts.gstatic.com"],
            "img-src": ["'self'", "data:", "https://api.dicebear.com", "https://*.s3.amazonaws.com"],
        },
    },
}));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Set timeout for uploads
httpServer.requestTimeout = 60000; // 60 secondes
httpServer.headersTimeout = 65000; // 65 secondes

// Admin static - specifically before the catch-all
app.use('/admin', express.static(path.join(__dirname, '../../frontend/admin')));
// Serve uploaded files statically
app.use('/public/uploads', express.static(path.join(__dirname, '../uploads')));
// Frontend static
app.use(express.static(path.join(__dirname, '../../frontend')));

app.get('/api/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', chatRouter(io, onlineUsers));
// Route upload (doit être APRÈS chatRouter car chatRouter monte /api aussi)
app.use('/api/upload', uploadRoutes);

// Clean URLs for Frontend
app.get('/u/:username', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/profile.html'));
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/settings.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/search.html'));
});

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/chat.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/register.html'));
});

// Fix for spa-like routing if needed, or just let static handle it
app.get('/api/health', (req, res) => {
    res.json({ status: "ok", message: "✅ ConnectMail API is running" });
});



const PORT = process.env.PORT || 6000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Serveur ConnectMail démarré sur http://localhost:${PORT}`);
});