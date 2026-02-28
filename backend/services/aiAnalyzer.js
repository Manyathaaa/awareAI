import PhishingEvent from '../models/PhishingEvent.js';
import RiskScore from '../models/RiskScore.js';
import Training from '../models/Training.js';

/**
 * Analyse a user's security behaviour and return a structured report.
 * Plug in your LLM (OpenAI, Anthropic, etc.) here for richer narratives.
 */
export const analyzeUserBehavior = async (userId) => {
  const [events, latestRisk, trainings] = await Promise.all([
    PhishingEvent.find({ user: userId }).sort('-timestamp').limit(50),
    RiskScore.findOne({ user: userId }).sort('-calculatedAt'),
    Training.find({ assignedTo: userId }),
  ]);

  const clickCount = events.filter((e) => e.eventType === 'clicked').length;
  const reportCount = events.filter((e) => e.eventType === 'reported').length;
  const completedCount = trainings.filter((t) =>
    t.completedBy.some((c) => c.user.toString() === userId.toString())
  ).length;

  const report = {
    userId,
    analyzedAt: new Date(),
    riskLevel: latestRisk?.level ?? 'unknown',
    riskScore: latestRisk?.score ?? null,
    summary: {
      phishingClicks: clickCount,
      threatsReported: reportCount,
      trainingsAssigned: trainings.length,
      trainingsCompleted: completedCount,
    },
    behaviorFlags: [],
    // TODO: enrich with LLM narrative via process.env.OPENAI_API_KEY
  };

  if (clickCount > 3) report.behaviorFlags.push('Repeated phishing link clicks');
  if (reportCount === 0 && clickCount > 0) report.behaviorFlags.push('No threat reports despite phishing exposure');
  if (completedCount < trainings.length * 0.5) report.behaviorFlags.push('Low training completion rate');

  return report;
};

/**
 * Generate personalised training recommendations for a user.
 */
export const generateRecommendations = async (userId) => {
  const events = await PhishingEvent.find({ user: userId });
  const clicked = events.some((e) => e.eventType === 'clicked');

  const recommendations = [];

  if (clicked) {
    recommendations.push({
      category: 'phishing',
      reason: 'You clicked a simulated phishing link. Complete the phishing awareness module.',
      priority: 'high',
    });
  }

  recommendations.push({
    category: 'password',
    reason: 'Password hygiene is a core security skill.',
    priority: 'medium',
  });

  recommendations.push({
    category: 'social-engineering',
    reason: 'Understanding social engineering reduces human risk.',
    priority: 'medium',
  });

  return { userId, generatedAt: new Date(), recommendations };
};
