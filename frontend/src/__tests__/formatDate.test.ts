import { describe, it, expect } from 'vitest';
import { formatDateTime, formatRelativeTime } from '../utils/formatDate';

describe('formatDate utility', () => {
  it('formats ISO UTC datetime to Vietnamese format GMT+7', () => {
    // 2026-10-27T01:29:48.000Z in UTC is 08:29:48 on 27/10/2026 in Asia/Ho_Chi_Minh (+7)
    const result = formatDateTime('2026-10-27T01:29:48.000Z');
    expect(result).toBe('08:29:48 27/10/2026');
  });

  it('handles null and undefined gracefully with an em-dash', () => {
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime(undefined)).toBe('—');
    expect(formatDateTime('')).toBe('—');
  });

  it('preserves invalid dates as fallback', () => {
    expect(formatDateTime('invalid-date')).toBe('invalid-date');
  });

  it('formats relative time for recent timestamps', () => {
    const nowIso = new Date().toISOString();
    expect(formatRelativeTime(nowIso)).toBe('Vừa xong');

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 phút trước');

    const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
    expect(formatRelativeTime(twoHoursAgo)).toBe('2 giờ trước');
  });
});
