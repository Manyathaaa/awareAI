import express from 'express';
import { getRiskScores, getUserRiskScore, recalculateRisk } from '../controllers/riskController.js';
import { protect } from '../middlewares/auth.js';
import { restrictTo } from '../middlewares/roles.js';

const router = express.Router();

router.use(protect);

router.get('/', getRiskScores);
router.get('/:userId', getUserRiskScore);
router.post('/calculate/:userId', restrictTo('admin', 'manager'), recalculateRisk);

export default router;
