import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['phishing', 'training', 'awareness'], required: true },
    status: { type: String, enum: ['draft', 'active', 'completed', 'archived'], default: 'draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    startDate: { type: Date },
    endDate: { type: Date },
    emailTemplate: { type: String, default: '' },
    phishingUrl: { type: String, default: '' },
    stats: {
      sent: { type: Number, default: 0 },
      opened: { type: Number, default: 0 },
      clicked: { type: Number, default: 0 },
      reported: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Campaign', campaignSchema);
