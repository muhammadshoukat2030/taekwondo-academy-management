import express from 'express';
import {
  getAchievements,
  createAchievement,
  deleteAchievement
} from '../controllers/achievementController.js';

const router = express.Router();

router.route('/')
  .get(getAchievements)
  .post(createAchievement);

router.route('/:id')
  .delete(deleteAchievement);

export default router;
