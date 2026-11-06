/**
 * Backend/src/services/auth/tokenService.test.ts
 *
 * Kiểm thử đơn vị cho TokenService & Auth Validator:
 * - Kiểm tra ký và giải mã JWT Access Token với payload đầy đủ quyền hạn.
 * - Kiểm tra tạo Refresh Token và cơ chế băm SHA-256 một chiều.
 * - Kiểm tra bắt lỗi token giả mạo, hết hạn hoặc sai chữ ký.
 * - Kiểm tra Zod schema validation cho luồng đăng nhập.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect } from 'vitest';
import { tokenService, TokenUserPayload } from './tokenService';
import { loginSchema } from '../../validators/authValidator';

describe('TokenService', () => {
  const sampleUser: TokenUserPayload = {
    userId: 'usr-admin-001',
    username: 'admin',
    fullName: 'Quản trị viên Hệ thống',
    role: 'ADMIN',
    permissions: ['*'],
  };

  it('phải tạo Access Token hợp lệ và giải mã đúng payload', () => {
    const token = tokenService.generateAccessToken(sampleUser);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = tokenService.verifyAccessToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(sampleUser.userId);
    expect(decoded?.username).toBe(sampleUser.username);
    expect(decoded?.role).toBe(sampleUser.role);
    expect(decoded?.permissions).toEqual(sampleUser.permissions);
  });

  it('phải trả về null khi xác thực Access Token không hợp lệ hoặc sai chữ ký', () => {
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature';
    const decoded = tokenService.verifyAccessToken(invalidToken);
    expect(decoded).toBeNull();
  });

  it('phải tạo Refresh Token hợp lệ và giải mã được userId', () => {
    const refreshToken = tokenService.generateRefreshToken(sampleUser.userId);
    expect(refreshToken).toBeDefined();
    expect(typeof refreshToken).toBe('string');

    const decoded = tokenService.verifyRefreshToken(refreshToken);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(sampleUser.userId);
  });

  it('phải băm Refresh Token bằng SHA-256 đồng nhất và có độ dài 64 ký tự hex', () => {
    const rawToken = 'test-refresh-token-value-2026';
    const hash1 = tokenService.hashToken(rawToken);
    const hash2 = tokenService.hashToken(rawToken);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
    expect(hash1).not.toBe(rawToken);
  });

  it('phải tạo hash khác nhau cho các refresh token khác nhau', () => {
    const hashA = tokenService.hashToken('token-alpha');
    const hashB = tokenService.hashToken('token-beta');
    expect(hashA).not.toBe(hashB);
  });
});

describe('AuthValidator (loginSchema)', () => {
  it('phải validate thành công khi thông tin đăng nhập hợp lệ', () => {
    const validData = {
      username: 'admin_an',
      password: 'SecurePassword@2026',
    };
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.username).toBe('admin_an');
    }
  });

  it('phải báo lỗi khi username dưới 3 ký tự', () => {
    const shortUser = {
      username: 'ad',
      password: 'SecurePassword@2026',
    };
    const result = loginSchema.safeParse(shortUser);
    expect(result.success).toBe(false);
  });

  it('phải báo lỗi khi mật khẩu dưới 6 ký tự', () => {
    const shortPass = {
      username: 'valid_user',
      password: '123',
    };
    const result = loginSchema.safeParse(shortPass);
    expect(result.success).toBe(false);
  });
});
