import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import phishingRoutes from './routes/phishingRoutes.js';
import riskRoutes from './routes/riskRoutes.js';
import trainingRoutes from './routes/trainingRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'AwareAI API is running 🚀' }));

app.use('/api/auth',     authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/phishing',  phishingRoutes);
app.use('/api/risk',      riskRoutes);
app.use('/api/training',  trainingRoutes);
app.use('/api/ai',        aiRoutes);

// ── 404 handler ─────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

// ── Global error handler ─────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// ── Database + Server ────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

