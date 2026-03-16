import express from 'express';
import {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  sendCampaign,
} from '../controllers/campaignController.js';
import { protect } from '../middlewares/auth.js';
import { restrictTo } from '../middlewares/roles.js';

const router = express.Router();

router.use(protect); // all campaign routes require login

// Send campaign to all target users
router.post('/:id/send', restrictTo('admin', 'manager'), sendCampaign);

router.route('/')
  .get(getCampaigns)
  .post(restrictTo('admin', 'manager'), createCampaign);

router.route('/:id')
  .get(getCampaign)
  .patch(restrictTo('admin', 'manager'), updateCampaign)
  .delete(restrictTo('admin'), deleteCampaign);

export default router;
