import { analyzeUserBehavior, generateRecommendations } from '../services/aiAnalyzer.js';

// POST /api/ai/analyze/:userId — run AI behavior analysis
export const analyzeUser = async (req, res) => {
  try {
    const report = await analyzeUserBehavior(req.params.userId);
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/ai/recommendations/:userId — get personalized training recommendations
export const getRecommendations = async (req, res) => {
  try {
    const recommendations = await generateRecommendations(req.params.userId);
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/ai/chat — AI security assistant (simple Q&A)
export const chatAssistant = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    // Stub: replace with real LLM call (OpenAI, etc.)
    const reply = `[AI] Received: "${message}". (Connect your LLM provider in aiAnalyzer.js)`;
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
