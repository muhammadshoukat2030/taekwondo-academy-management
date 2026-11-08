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
import dashboardRoutes from './routes/dashboardRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { protectAdmin } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration supporting credentials (cookies)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // 1. Allow non-browser requests (mobile apps, curl, server-to-server) or same-origin
      if (!origin) {
        return callback(null, true);
      }

      // 2. Allow configured production frontend or local development
      if (allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o))) {
        return callback(null, true);
      }

      // 3. Allow Vercel preview and production deployments (*.vercel.app)
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // 4. Fallback for non-production environments
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Public Authentication Endpoints
app.use('/api/auth', authRoutes);

// Protected Admin-Only REST API Endpoints
app.use('/api/students', protectAdmin, studentRoutes);
app.use('/api/attendance', protectAdmin, attendanceRoutes);
app.use('/api/fees', protectAdmin, feeRoutes);
app.use('/api/certificates', protectAdmin, certificateRoutes);
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
