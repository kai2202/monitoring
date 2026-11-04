/**
 * Backend/tests/app.test.ts
 *
 * Kiểm thử endpoint kiểm tra sức khỏe hệ thống /api/health.
 */

import { describe, it, expect } from 'vitest';
import { app } from '../src/app';

describe('Backend Health Check API', () => {
  it('phải có router và app Express hợp lệ', () => {
    expect(app).toBeDefined();
    expect(typeof app.use).toBe('function');
  });
});

