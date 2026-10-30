import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import studentRoutes from './routes/studentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// REST API Endpoints
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
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
