/**
 * Backend/src/middlewares/rateLimiter.ts
 *
 * Middleware giới hạn tốc độ truy cập (Rate Limiting) phòng chống Brute Force & DoS:
 * - authLimiter: Giới hạn tối đa 5 lần thử đăng nhập thất bại trong 15 phút.
 * - apiLimiter: Giới hạn tần suất chung cho các API thông thường.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import rateLimit from 'express-rate-limit';

/**
 * Giới hạn chống Brute-force mật khẩu đối với endpoint /auth/login
 * Chỉ tính các request thất bại (status >= 400)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Tối đa 5 lần đăng nhập sai
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_FAILED_LOGINS',
      message: 'Tài khoản hoặc IP đã thử đăng nhập thất bại quá 5 lần. Vui lòng thử lại sau 15 phút.',
    },
    timestamp: new Date().toISOString(),
  },
});

/**
 * Giới hạn tần suất chung cho toàn bộ các endpoints API
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600, // 600 requests / 15 phút
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.',
    },
    timestamp: new Date().toISOString(),
  },
});

