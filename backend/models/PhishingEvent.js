import mongoose from 'mongoose';

const phishingEventSchema = new mongoose.Schema(
  {
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventType: {
      type: String,
      enum: ['sent', 'opened', 'clicked', 'submitted', 'reported'],
      required: true,
    },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model('PhishingEvent', phishingEventSchema);
