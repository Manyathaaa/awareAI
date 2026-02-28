import RiskScore from '../models/RiskScore.js';
import { calculateRisk } from '../services/riskEngine.js';

// GET /api/risk — list scores (admin sees all, others see own)
export const getRiskScores = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user.id };
    const scores = await RiskScore.find(filter)
      .populate('user', 'name email department')
      .sort('-calculatedAt');
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/risk/:userId — score for a specific user
export const getUserRiskScore = async (req, res) => {
  try {
    const score = await RiskScore.findOne({ user: req.params.userId })
      .sort('-calculatedAt')
      .populate('user', 'name email');
    if (!score) return res.status(404).json({ message: 'No risk score found for this user' });
    res.json(score);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/risk/calculate/:userId — trigger recalculation
export const recalculateRisk = async (req, res) => {
  try {
    const result = await calculateRisk(req.params.userId);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
