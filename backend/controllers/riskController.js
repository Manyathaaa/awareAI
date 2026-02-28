import RiskScore from '../models/RiskScore.js';
import { calculateRisk } from '../services/riskEngine.js';

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/risk
// Admin → latest score for every user (leaderboard / org view)
// Manager → latest score for every user in the organisation
// Employee → own latest score only
// Returns one record per user (most recent calculatedAt)
// ─────────────────────────────────────────────────────────────────────────────
export const getRiskScores = async (req, res) => {
  try {
    const isPrivileged = ['admin', 'manager'].includes(req.user.role);
    const matchStage = isPrivileged ? {} : { user: req.user._id ?? req.user.id };

    // Aggregate to get the latest score per user
    const scores = await RiskScore.aggregate([
      { $match: matchStage },
      { $sort: { calculatedAt: -1 } },
      {
        $group: {
          _id: '$user',
          doc: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$doc' } },
      { $sort: { score: -1 } }, // highest risk first
    ]);

    // Populate user details after aggregation
    await RiskScore.populate(scores, { path: 'user', select: 'name email department role' });

    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/risk/:userId — latest score for a specific user
// Employees can only view their own score
// ─────────────────────────────────────────────────────────────────────────────
export const getUserRiskScore = async (req, res) => {
  try {
    const requesterId = String(req.user._id ?? req.user.id);
    const targetId    = req.params.userId;

    // Employees may only see their own score
    if (req.user.role === 'employee' && requesterId !== targetId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const score = await RiskScore.findOne({ user: targetId })
      .sort('-calculatedAt')
      .populate('user', 'name email department');

    if (!score) return res.status(404).json({ message: 'No risk score found for this user' });
    res.json(score);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/risk/:userId/history — last N calculations (default 10)
// Employees can only view their own history
// ─────────────────────────────────────────────────────────────────────────────
export const getRiskHistory = async (req, res) => {
  try {
    const requesterId = String(req.user._id ?? req.user.id);
    const targetId    = req.params.userId;

    if (req.user.role === 'employee' && requesterId !== targetId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const history = await RiskScore.find({ user: targetId })
      .sort('-calculatedAt')
      .limit(limit)
      .select('score level calculatedAt factors');

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/risk/calculate/:userId — trigger recalculation
// Admins/managers can recalc anyone; employees can recalc themselves only
// ─────────────────────────────────────────────────────────────────────────────
export const recalculateRisk = async (req, res) => {
  try {
    const requesterId = String(req.user._id ?? req.user.id);
    const targetId    = req.params.userId;

    if (req.user.role === 'employee' && requesterId !== targetId) {
      return res.status(403).json({ message: 'Employees can only recalculate their own score' });
    }

    const result = await calculateRisk(targetId);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
