import Training from '../models/Training.js';
import Badge from '../models/Badge.js';
import User from '../models/User.js';

// GET /api/training
export const getTrainings = async (req, res) => {
  try {
    const trainings = await Training.find().select('-questions').sort('-createdAt');
    res.json(trainings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/training/:id
export const getTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id).populate('assignedTo', 'name email');
    if (!training) return res.status(404).json({ message: 'Training not found' });
    res.json(training);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/training
export const createTraining = async (req, res) => {
  try {
    const training = await Training.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(training);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// POST /api/training/:id/submit — submit quiz answers
export const submitTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: 'Training not found' });

    const { answers } = req.body; // array of selected option indices
    let correct = 0;
    training.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });

    const score = training.questions.length > 0
      ? Math.round((correct / training.questions.length) * 100)
      : 100;

    // Record completion
    training.completedBy.push({ user: req.user.id, score });
    await training.save();

    // Update user's trainingsCompleted
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { trainingsCompleted: training._id },
    });

    // Award badge if first training
    if (score >= training.passingScore) {
      const badge = await Badge.findOne({ criteria: 'first-training' });
      if (badge) {
        badge.awardedTo.push({ user: req.user.id });
        await badge.save();
        await User.findByIdAndUpdate(req.user.id, { $addToSet: { badges: badge._id } });
      }
    }

    res.json({ score, passed: score >= training.passingScore, total: training.questions.length, correct });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/training/:id
export const updateTraining = async (req, res) => {
  try {
    const training = await Training.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!training) return res.status(404).json({ message: 'Training not found' });
    res.json(training);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/training/:id
export const deleteTraining = async (req, res) => {
  try {
    const training = await Training.findByIdAndDelete(req.params.id);
    if (!training) return res.status(404).json({ message: 'Training not found' });
    res.json({ message: 'Training deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
