import express from 'express';
import { createUserByAdmin, register, login, getMe, updateMe } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { restrictTo } from '../middlewares/roles.js';
import { loginLimiter, registerLimiter } from '../middlewares/rateLimiters.js';

const router = express.Router();

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.post('/admin/users', protect, restrictTo('admin'), createUserByAdmin);

export default router;
