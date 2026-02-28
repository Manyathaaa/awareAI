import express from 'express';
import { analyzeUser, getRecommendations, chatAssistant } from '../controllers/aiController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

// All authenticated users can analyze themselves; managers/admins can analyze others (enforced in controller)
router.get('/analyze/:userId',         analyzeUser);
router.get('/recommendations/:userId', getRecommendations);
router.post('/chat',                   chatAssistant);

export default router;
