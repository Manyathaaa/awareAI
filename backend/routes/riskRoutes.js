import express from 'express';
import {
  getRiskScores,
  getUserRiskScore,
  getRiskHistory,
  recalculateRisk,
} from '../controllers/riskController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

// All authenticated users — RBAC enforced in controller
router.get('/',                     getRiskScores);
router.get('/:userId/history',      getRiskHistory);
router.get('/:userId',              getUserRiskScore);
router.post('/calculate/:userId',   recalculateRisk);

export default router;
