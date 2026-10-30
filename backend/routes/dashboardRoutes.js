import express from 'express';
import {
  getDashboardKPIs,
  getMonthlyAudit
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/kpis', getDashboardKPIs);
router.get('/audit', getMonthlyAudit);

export default router;
