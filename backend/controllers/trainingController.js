import Training from '../models/Training.js';
import Badge from '../models/Badge.js';
import User from '../models/User.js';

// GET /api/training
// Returns all modules — strips correctIndex from questions (not the whole completedBy array)
export const getTrainings = async (req, res) => {
  try {
    const trainings = await Training.find()
      .select('-questions.correctIndex')   // hide answers, keep completedBy & question text
      .sort('-createdAt');
    res.json(trainings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/training/my — trainings assigned to (or open to) the current user
export const getMyTrainings = async (req, res) => {
  try {
    // assignedTo: [] means open to everyone; non-empty means specific users only
    const trainings = await Training.find({
      $or: [{ assignedTo: { $size: 0 } }, { assignedTo: req.user.id }],
    }).select('-questions.correctIndex').sort('-createdAt');
    res.json(trainings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/training/:id — full document including questions (no correctIndex for employees)
export const getTraining = async (req, res) => {
  try {
    let query = Training.findById(req.params.id).populate('assignedTo', 'name email');

    // Hide correct answers for employees — managers/admins can see them (e.g. authoring)
    if (!['admin', 'manager'].includes(req.user.role)) {
      query = query.select('-questions.correctIndex');
    }

    const training = await query;
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

// POST /api/training/:id/submit — grade quiz answers, record completion, award badge
export const submitTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: 'Training not found' });

    const { answers } = req.body; // array of selected option indices
    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'answers must be an array of selected indices' });
    }

    // Grade
    let correct = 0;
    const feedback = training.questions.map((q, i) => {
      const chosen = answers[i] ?? -1;
      const isCorrect = chosen === q.correctIndex;
      if (isCorrect) correct++;
      return {
        question: q.question,
        chosen,
        correctIndex: q.correctIndex,
        correct: isCorrect,
      };
    });

    const score =
      training.questions.length > 0
        ? Math.round((correct / training.questions.length) * 100)
        : 100;

    const passed = score >= training.passingScore;

    // Upsert completion record (no duplicate entries on retry)
    const existingIdx = training.completedBy.findIndex(
      (c) => String(c.user) === String(req.user.id)
    );
    if (existingIdx >= 0) {
      training.completedBy[existingIdx].score = score;
      training.completedBy[existingIdx].completedAt = new Date();
      training.markModified('completedBy');
    } else {
      training.completedBy.push({ user: req.user.id, score });
    }
    await training.save();

    // Update user's trainingsCompleted (only on pass)
    if (passed) {
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { trainingsCompleted: training._id },
      });

      // Award 'first-training' badge if applicable
      const badge = await Badge.findOne({ criteria: 'first-training' });
      if (badge) {
        const alreadyAwarded = badge.awardedTo.some(
          (a) => String(a.user) === String(req.user.id)
        );
        if (!alreadyAwarded) {
          badge.awardedTo.push({ user: req.user.id });
          await badge.save();
          await User.findByIdAndUpdate(req.user.id, { $addToSet: { badges: badge._id } });
        }
      }
    }

    res.json({
      score,
      passed,
      total: training.questions.length,
      correct,
      feedback, // per-question breakdown with correctIndex revealed post-submission
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/training/:id/assign — assign module to specific users (admin/manager only)
export const assignTraining = async (req, res) => {
  try {
    const { userIds } = req.body; // array of user _ids
    if (!Array.isArray(userIds)) {
      return res.status(400).json({ message: 'userIds must be an array' });
    }

    const training = await Training.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { assignedTo: { $each: userIds } } },
      { new: true }
    );
    if (!training) return res.status(404).json({ message: 'Training not found' });
    res.json(training);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
