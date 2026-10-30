import express from 'express';
import {
  markAttendance,
  getTodayAttendance,
  batchMarkAttendance,
  getMonthlyAttendanceReport
} from '../controllers/attendanceController.js';

const router = express.Router();

// GET / POST /api/attendance
router.route('/')
  .get(getTodayAttendance)
  .post(markAttendance);

// Specific routes
router.post('/mark', markAttendance);
router.post('/batch', batchMarkAttendance);
router.get('/today', getTodayAttendance);
router.get('/monthly-report', getMonthlyAttendanceReport);
router.get('/matrix', getMonthlyAttendanceReport);

export default router;
