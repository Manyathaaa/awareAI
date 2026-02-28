import express from 'express';
import { analyzeUser, getRecommendations, chatAssistant } from '../controllers/aiController.js';
import { protect } from '../middlewares/auth.js';
import { restrictTo } from '../middlewares/roles.js';

const router = express.Router();

router.use(protect);

router.post('/analyze/:userId', restrictTo('admin', 'manager'), analyzeUser);
router.get('/recommendations/:userId', getRecommendations);
router.post('/chat', chatAssistant);

export default router;
