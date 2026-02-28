import express from 'express';
import { trackEvent, getEvents, getCampaignStats } from '../controllers/phishingController.js';
import { protect } from '../middlewares/auth.js';
import { restrictTo } from '../middlewares/roles.js';

const router = express.Router();

// Public — phishing tracking links call this without auth
router.post('/track', trackEvent);

// Protected routes
router.use(protect);
router.get('/events', restrictTo('admin', 'manager'), getEvents);
router.get('/stats/:campaignId', restrictTo('admin', 'manager'), getCampaignStats);

export default router;
