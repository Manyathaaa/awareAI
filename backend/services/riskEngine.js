import PhishingEvent from '../models/PhishingEvent.js';
import Training from '../models/Training.js';
import RiskScore from '../models/RiskScore.js';
import User from '../models/User.js';

/**
 * Calculate a user's risk score based on phishing behaviour and training completion.
 * Score is 0–100 (higher = riskier).
 */
export const calculateRisk = async (userId) => {
  // --- Phishing signals ---
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [clicks, reports] = await Promise.all([
    PhishingEvent.countDocuments({ user: userId, eventType: 'clicked', timestamp: { $gte: thirtyDaysAgo } }),
    PhishingEvent.countDocuments({ user: userId, eventType: 'reported', timestamp: { $gte: thirtyDaysAgo } }),
  ]);

  // --- Training signals ---
  const trainings = await Training.find({ assignedTo: userId });
  const completed = trainings.filter((t) =>
    t.completedBy.some((c) => c.user.toString() === userId.toString())
  ).length;
  const trainingCompletionRate = trainings.length > 0 ? (completed / trainings.length) * 100 : 100;

  // --- Score formula ---
  // Clicks add risk; reports and training completion reduce it
  const raw =
    Math.min(clicks * 15, 60)          // up to 60 pts from clicks
    - Math.min(reports * 10, 20)        // up to −20 for reporting threats
    - Math.min(trainingCompletionRate * 0.4, 40); // up to −40 for training

  const score = Math.max(0, Math.min(100, Math.round(raw)));

  const riskDoc = await RiskScore.create({
    user: userId,
    score,
    level: 'low', // pre-save hook will set the real level
    factors: {
      phishingClicks: clicks,
      trainingCompletion: Math.round(trainingCompletionRate),
      reportedThreats: reports,
    },
  });

  // Sync to User.riskScore for quick lookups
  await User.findByIdAndUpdate(userId, { riskScore: score });

  return riskDoc;
};
