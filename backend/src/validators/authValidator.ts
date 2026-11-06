/**
 * Backend/src/validators/authValidator.ts
 *
 * Zod Schemas xác thực dữ liệu đầu vào cho Auth Module (FleetMonitor):
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { z } from 'zod';

export const loginSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Tên đăng nhập tối thiểu 3 ký tự')
      .max(100, 'Tên đăng nhập không quá 100 ký tự')
      .trim()
      .optional(),
    email: z
      .string()
      .email('Định dạng email không hợp lệ')
      .max(100, 'Email không quá 100 ký tự')
      .trim()
      .optional(),
    password: z
      .string({ required_error: 'Vui lòng nhập mật khẩu' })
      .min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  })
  .refine((data) => Boolean(data.username || data.email), {
    message: 'Vui lòng nhập tên đăng nhập hoặc email',
    path: ['username'],
  });

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
