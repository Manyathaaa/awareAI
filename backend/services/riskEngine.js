import PhishingEvent from '../models/PhishingEvent.js';
import Training from '../models/Training.js';
import RiskScore from '../models/RiskScore.js';
import User from '../models/User.js';

// ─────────────────────────────────────────────────────────────────────────────
// RISK SCORE ENGINE  (0 = safest, 100 = most at risk)
//
// Starting point: 50 (neutral)
//
// RISK INCREASES (+):
//   Phishing click (30 days)     +15 per click, capped at +45
//   Credentials submitted        +20 per submission, capped at +40
//   Never reported anything      +10 flat
//   Training incomplete < 50%    +15
//   Training incomplete 50–79%   +5
//
// RISK DECREASES (−):
//   Threat reported              −8 per report, capped at −24
//   Training completion 100%     −20
//   Training completion 80–99%   −10
//   Fast report (< 5 min avg)    −5 bonus
//
// Final: clamped [0, 100]
// ─────────────────────────────────────────────────────────────────────────────

export const calculateRisk = async (userId) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // ── Phishing signals ────────────────────────────────────────────────────────
  const [allEvents, recentClicks, recentSubmits, recentReports] = await Promise.all([
    PhishingEvent.find({ user: userId }).sort('timestamp'),
    PhishingEvent.countDocuments({ user: userId, eventType: 'clicked',   timestamp: { $gte: thirtyDaysAgo } }),
    PhishingEvent.countDocuments({ user: userId, eventType: 'submitted', timestamp: { $gte: thirtyDaysAgo } }),
    PhishingEvent.countDocuments({ user: userId, eventType: 'reported',  timestamp: { $gte: thirtyDaysAgo } }),
  ]);

  // Time-to-report: average minutes between a "sent" and subsequent "reported" for same campaign
  let avgTimeToReport = null;
  const sentEvents = allEvents.filter((e) => e.eventType === 'sent');
  const reportedEvents = allEvents.filter((e) => e.eventType === 'reported');
  const reportTimes = [];
  for (const sent of sentEvents) {
    const match = reportedEvents.find(
      (r) => String(r.campaign) === String(sent.campaign) && r.timestamp >= sent.timestamp
    );
    if (match) {
      reportTimes.push((match.timestamp - sent.timestamp) / 60000); // convert ms → minutes
    }
  }
  if (reportTimes.length > 0) {
    avgTimeToReport = Math.round(reportTimes.reduce((a, b) => a + b, 0) / reportTimes.length);
  }

  // ── Training signals ────────────────────────────────────────────────────────
  const trainings = await Training.find({ assignedTo: userId });
  const completedCount = trainings.filter((t) =>
    t.completedBy?.some((c) => String(c.user) === String(userId))
  ).length;
  const total = trainings.length;
  const completionPct = total > 0 ? Math.round((completedCount / total) * 100) : 100;

  // ── Score formula ───────────────────────────────────────────────────────────
  let score = 50; // neutral baseline

  // Increases
  score += Math.min(recentClicks * 15, 45);   // clicks
  score += Math.min(recentSubmits * 20, 40);  // credential submission (serious)
  if (recentReports === 0 && (recentClicks > 0 || recentSubmits > 0)) {
    score += 10;                              // never reported despite exposure
  }
  if (completionPct < 50)  score += 15;      // very low training
  else if (completionPct < 80) score += 5;   // partial training

  // Decreases
  score -= Math.min(recentReports * 8, 24);  // reporting threats
  if (completionPct === 100 && total > 0) score -= 20; // fully trained
  else if (completionPct >= 80)             score -= 10; // mostly trained
  if (avgTimeToReport !== null && avgTimeToReport < 5) score -= 5; // fast reporter

  // New users with no data at all get a neutral 50 base — apply a small reduction
  // if they have zero risk events (they're clean, not dangerous)
  const hasAnyData = total > 0 || allEvents.length > 0;
  if (!hasAnyData) score = 30; // genuinely new user — start them low, not neutral

  score = Math.max(0, Math.min(100, Math.round(score)));

  // ── Persist ─────────────────────────────────────────────────────────────────
  const riskDoc = await RiskScore.create({
    user: userId,
    score,
    level: 'low', // pre-save hook sets real level
    factors: {
      phishingClicks:       recentClicks,
      credentialsSubmitted: recentSubmits,
      trainingCompletion:   completionPct,
      reportedThreats:      recentReports,
      timeToReport:         avgTimeToReport ?? 0,
    },
  });

  // Keep User.riskScore in sync for quick dashboard lookups
  await User.findByIdAndUpdate(userId, { riskScore: score });

  return riskDoc;
};

