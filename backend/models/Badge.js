import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    iconUrl: { type: String, default: '' },
    criteria: {
      type: String,
      enum: [
        'first-training',
        'phishing-reporter',
        'zero-clicks',
        'perfect-score',
        'streak-7',
        'custom',
      ],
      default: 'custom',
    },
    awardedTo: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        awardedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Badge', badgeSchema);
