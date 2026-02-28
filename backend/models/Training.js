import mongoose from 'mongoose';

const trainingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['phishing', 'password', 'social-engineering', 'data-privacy', 'general'],
      default: 'general',
    },
    contentUrl: { type: String, default: '' }, // link to video / article
    durationMinutes: { type: Number, default: 0 },
    passingScore: { type: Number, default: 70 }, // %
    questions: [
      {
        question: String,
        options: [String],
        correctIndex: Number,
      },
    ],
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    completedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        score: Number,
        completedAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Training', trainingSchema);
