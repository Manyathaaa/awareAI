import { analyzeUserBehavior, generateRecommendations, answerChat } from '../services/aiAnalyzer.js';

// GET /api/ai/analyze/:userId — run AI behaviour analysis (GET so browser/axios can call easily)
export const analyzeUser = async (req, res) => {
  try {
    // Non-admins can only analyse themselves
    const targetId = req.params.userId;
    if (req.user.role === 'employee' && String(req.user.id) !== String(targetId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const report = await analyzeUserBehavior(targetId);
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/ai/recommendations/:userId — personalised training recommendations
export const getRecommendations = async (req, res) => {
  try {
    const targetId = req.params.userId;
    if (req.user.role === 'employee' && String(req.user.id) !== String(targetId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const result = await generateRecommendations(targetId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/ai/chat — rule-based cybersecurity assistant
export const chatAssistant = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }
    const result = answerChat(message);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
