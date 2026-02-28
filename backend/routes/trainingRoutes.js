import express from 'express';
import {
  getTrainings,
  getMyTrainings,
  getTraining,
  createTraining,
  submitTraining,
  assignTraining,
  updateTraining,
  deleteTraining,
} from '../controllers/trainingController.js';
import { protect } from '../middlewares/auth.js';
import { restrictTo } from '../middlewares/roles.js';

const router = express.Router();

router.use(protect);

router.get('/my', getMyTrainings);

router.route('/')
  .get(getTrainings)
  .post(restrictTo('admin', 'manager'), createTraining);

router.route('/:id')
  .get(getTraining)
  .patch(restrictTo('admin', 'manager'), updateTraining)
  .delete(restrictTo('admin'), deleteTraining);

router.post('/:id/submit', submitTraining);
router.post('/:id/assign', restrictTo('admin', 'manager'), assignTraining);

export default router;
