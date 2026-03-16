import { rateLimit } from 'express-rate-limit';

const authRateLimitMessage = 'Too many authentication attempts. Please try again later.';

export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: authRateLimitMessage },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: authRateLimitMessage },
});
