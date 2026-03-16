import User from '../models/User.js';
import { sendPhishingEmail } from '../services/emailService.js';
import PhishingEvent from '../models/PhishingEvent.js';
// POST /api/campaigns/:id/send — send campaign to all target users
export const sendCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('targetUsers', 'email name');
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    if (!campaign.targetUsers || campaign.targetUsers.length === 0) {
      return res.status(400).json({ message: 'No target users assigned to this campaign.' });
    }
    let sentCount = 0;
    for (const user of campaign.targetUsers) {
      // Send email (replace with real template/logic as needed)
      await sendPhishingEmail({
        to: user.email,
        subject: campaign.name,
        html: campaign.emailTemplate || `<p>${campaign.description}</p>`
      });
      // Record 'sent' event
      await PhishingEvent.create({
        campaign: campaign._id,
        user: user._id,
        eventType: 'sent',
        metadata: { campaignType: campaign.type }
      });
      sentCount++;
    }
    // Update campaign stats
    campaign.stats.sent += sentCount;
    await campaign.save();
    res.json({ message: `Campaign sent to ${sentCount} users.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
import Campaign from '../models/Campaign.js';

// GET /api/campaigns
export const getCampaigns = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { createdBy: req.user.id };
    const campaigns = await Campaign.find(filter).populate('createdBy', 'name email').sort('-createdAt');
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/campaigns/:id
export const getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('targetUsers', 'name email department');
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/campaigns
export const createCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(campaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PATCH /api/campaigns/:id
export const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/campaigns/:id
export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json({ message: 'Campaign deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
