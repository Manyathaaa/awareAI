import mongoose from 'mongoose';

const riskScoreSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    level: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    factors: {
      phishingClicks:       { type: Number, default: 0 },
      credentialsSubmitted: { type: Number, default: 0 },
      trainingCompletion:   { type: Number, default: 0 }, // 0–100 %
      reportedThreats:      { type: Number, default: 0 },
      timeToReport:         { type: Number, default: 0 }, // avg minutes
    },
    calculatedAt: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Derive level from score
//   0–29  → low
//  30–54  → medium
//  55–74  → high
//  75–100 → critical
riskScoreSchema.pre('save', function () {
  if (this.score >= 75)      this.level = 'critical';
  else if (this.score >= 55) this.level = 'high';
  else if (this.score >= 30) this.level = 'medium';
  else                       this.level = 'low';
});

export default mongoose.model('RiskScore', riskScoreSchema);
