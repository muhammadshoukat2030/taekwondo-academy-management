import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { protectAdmin } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration supporting credentials (cookies and cross-origin Authorization headers)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

const isOriginAllowed = (origin) => {
  // 1. Allow non-browser requests (mobile apps, curl, server-to-server) or same-origin
  if (!origin) return true;

  // 2. Allow configured production frontend, http://localhost:3001, or local dev origins
  if (allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o))) {
    return true;
  }

  // 3. Allow any localhost or 127.0.0.1 port for local development
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }

  // 4. Allow Vercel preview and production deployments (*.vercel.app)
  if (origin.endsWith('.vercel.app')) {
    return true;
  }

  // 5. Fallback for non-production environments
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
};

// Ensure CORS middleware and preflight handlers run before all API routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// URL restoration middleware: If any proxy or serverless rewrite ever changes req.url to /server.js, restore the original path
app.use((req, res, next) => {
  if (req.url === '/server.js' || req.url.startsWith('/server.js?') || req.url.startsWith('/server.js/')) {
    const rawPath = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'] || req.headers['x-original-url'];
    if (rawPath && rawPath !== '/server.js' && !rawPath.startsWith('/server.js')) {
      req.url = rawPath;
    }
  }
  next();
});

// Ensure database connection before handling any request (essential for Vercel serverless execution)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('❌ [Database Connection Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Please verify MongoDB Atlas connection string and Network Access (0.0.0.0/0).'
    });
  }
});

// Root endpoint to verify backend status
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    system: 'Al Murtaza Shah Taekwondo Academy API Backend',
    documentation: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// Public Authentication Endpoints
app.use('/api/auth', authRoutes);

// Protected Admin-Only REST API Endpoints
app.use('/api/students', protectAdmin, studentRoutes);
app.use('/api/attendance', protectAdmin, attendanceRoutes);
app.use('/api/fees', protectAdmin, feeRoutes);
app.use('/api/certificates', protectAdmin, certificateRoutes);
app.use('/api/achievements', protectAdmin, achievementRoutes);
app.use('/api/dashboard', protectAdmin, dashboardRoutes);
app.use('/api/settings', settingsRoutes);

// Public Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Al Murtaza Shah Taekwondo Academy Management API (Pure MERN)',
    location: 'Abdur Rehman Plaza, Markaz Road, Chogi No.7, Kohat',
    contact: '0335-9117230',
    environment: process.env.NODE_ENV || 'development',
    serverless: Boolean(process.env.VERCEL),
    timestamp: new Date().toISOString()
  });
});

// Start Server for standalone execution (local development)
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '127.0.0.1', () => {
      console.log(`🥋 [Al Murtaza Shah TKD Express Backend] running on http://127.0.0.1:${PORT}`);
    });
  } catch (error) {
    console.error('❌ [Server Startup Failure]:', error.message);
    process.exit(1);
  }
};

// Only bind to local port when not executing inside a serverless provider like Vercel
if (!process.env.VERCEL) {
  startServer();
}

export default app;
