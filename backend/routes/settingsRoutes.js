import express from 'express';
import {
  getSettings,
  updateSettings,
  resetSettings
} from '../controllers/settingsController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET is public so header and components can initialize settings smoothly
router.get('/', getSettings);

// PUT and POST are protected: only authenticated administrators can update settings
router.put('/', protectAdmin, updateSettings);
router.post('/reset', protectAdmin, resetSettings);

export default router;
