import { describe, it, expect } from 'vitest';
import {
  getWasteFullness,
  getWasteRemainingSpace,
  isWasteCritical,
  isWasteWarning,
  getWasteFillColor
} from '../utils/supplies';

describe('Waste Toner Fullness & Color Utilities', () => {
  it('correctly inverts server remaining capacity to fullness rate', () => {
    // Server 100% space -> 0% full (empty container, safe)
    expect(getWasteFullness(100)).toBe(0);
    expect(getWasteRemainingSpace(100)).toBe(100);

    // Server 60% space -> 40% full (safe)
    expect(getWasteFullness(60)).toBe(40);
    expect(getWasteRemainingSpace(60)).toBe(60);

    // Server 20% space -> 80% full (warning: almost full)
    expect(getWasteFullness(20)).toBe(80);
    expect(getWasteRemainingSpace(20)).toBe(20);

    // Server 15% space -> 85% full (critical: full)
    expect(getWasteFullness(15)).toBe(85);
    expect(getWasteRemainingSpace(15)).toBe(15);

    // Server 0% space -> 100% full (critical: full)
    expect(getWasteFullness(0)).toBe(100);
    expect(getWasteRemainingSpace(0)).toBe(0);

    // Null or invalid values
    expect(getWasteFullness(null)).toBeNull();
    expect(getWasteRemainingSpace(null)).toBeNull();
  });

  it('correctly assesses warning and critical thresholds', () => {
    // Safe: fullness < 65% (server > 35)
    expect(isWasteWarning(100)).toBe(false);
    expect(isWasteCritical(100)).toBe(false);
    expect(isWasteWarning(60)).toBe(false);
    expect(isWasteCritical(60)).toBe(false);

    // Warning: 65% <= fullness < 85% (15 < server <= 35)
    expect(isWasteWarning(35)).toBe(true);
    expect(isWasteCritical(35)).toBe(false);
    expect(isWasteWarning(20)).toBe(true);
    expect(isWasteCritical(20)).toBe(false);

    // Critical: fullness >= 85% (server <= 15)
    expect(isWasteWarning(15)).toBe(false);
    expect(isWasteCritical(15)).toBe(true);
    expect(isWasteWarning(0)).toBe(false);
    expect(isWasteCritical(0)).toBe(true);
  });

  it('assigns correct colors according to requirements', () => {
    // Safe: purple (#8b5cf6), never red
    expect(getWasteFillColor(100)).toBe('#8b5cf6');
    expect(getWasteFillColor(60)).toBe('#8b5cf6');

    // Warning: amber (#f59e0b)
    expect(getWasteFillColor(25)).toBe('#f59e0b');

    // Critical: red (#ef4444)
    expect(getWasteFillColor(10)).toBe('#ef4444');
    expect(getWasteFillColor(0)).toBe('#ef4444');
  });
});
