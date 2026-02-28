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
