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
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev fallback for local network
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Public Authentication Endpoints
app.use('/api/auth', authRoutes);

// Protected Admin-Only REST API Endpoints
app.use('/api/students', protectAdmin, studentRoutes);
app.use('/api/attendance', protectAdmin, attendanceRoutes);
app.use('/api/fees', protectAdmin, feeRoutes);
app.use('/api/certificates', protectAdmin, certificateRoutes);
app.use('/api/dashboard', protectAdmin, dashboardRoutes);
app.use('/api/settings', settingsRoutes);

// Public Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Al Murtaza Shah Taekwondo Academy Management API (Pure MERN)',
    location: 'Abdur Rehman Plaza, Markaz Road, Chogi No.7, Kohat',
    contact: '0335-9117230',
    timestamp: new Date().toISOString()
  });
});

// Start Server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`🥋 [Al Murtaza Shah TKD Express Backend] running on http://127.0.0.1:${PORT}`);
  });
};

startServer();
