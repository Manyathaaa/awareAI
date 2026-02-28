import PhishingEvent from '../models/PhishingEvent.js';
import Campaign from '../models/Campaign.js';

// POST /api/phishing/track  — called by phishing links (no auth required)
export const trackEvent = async (req, res) => {
  try {
    const { campaignId, userId, eventType, ipAddress, userAgent, metadata } = req.body;

    const event = await PhishingEvent.create({
      campaign: campaignId,
      user: userId,
      eventType,
      ipAddress: ipAddress || req.ip,
      userAgent: userAgent || req.headers['user-agent'],
      metadata,
    });

    // Update campaign stats
    const statKey = `stats.${eventType}`;
    await Campaign.findByIdAndUpdate(campaignId, { $inc: { [statKey]: 1 } });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/phishing/events — all events (admin/manager)
export const getEvents = async (req, res) => {
  try {
    const { campaignId, userId, eventType } = req.query;
    const filter = {};
    if (campaignId) filter.campaign = campaignId;
    if (userId) filter.user = userId;
    if (eventType) filter.eventType = eventType;

    const events = await PhishingEvent.find(filter)
      .populate('user', 'name email department')
      .populate('campaign', 'name')
      .sort('-timestamp');

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/phishing/stats/:campaignId — click-through & report rates
export const getCampaignStats = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    const { stats } = campaign;
    const clickRate = stats.sent > 0 ? ((stats.clicked / stats.sent) * 100).toFixed(1) : 0;
    const reportRate = stats.sent > 0 ? ((stats.reported / stats.sent) * 100).toFixed(1) : 0;

    res.json({ campaign: campaign.name, stats, clickRate: `${clickRate}%`, reportRate: `${reportRate}%` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
