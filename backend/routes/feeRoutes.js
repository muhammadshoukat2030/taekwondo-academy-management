import express from 'express';
import {
  getFees,
  collectFee,
  getDefaulters,
  getFinancialSummary,
  generateMonthlyDues
} from '../controllers/feeController.js';

const router = express.Router();

// GET / POST /api/fees
router.route('/')
  .get(getFees)
  .post(collectFee);

router.post('/collect', collectFee);
router.get('/defaulters', getDefaulters);
router.get('/summary', getFinancialSummary);
router.post('/generate-monthly-dues', generateMonthlyDues);

export default router;
