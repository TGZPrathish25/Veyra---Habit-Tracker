/** Unit test — time utilities with Indian Standard Time (Asia/Kolkata). */
import { describe, it, expect } from 'vitest';
import {
  getMonthBoundaries,
  getLocalDateString,
  getIndianTodayDateString,
  getWeekMondayDate,
  getCurrentYearAndMonth,
  INDIA_TIMEZONE,
  DEFAULT_TIMEZONE,
} from '../../src/lib/time.js';

describe('time utilities', () => {
  it('should compute month boundaries', () => {
    const { start, end } = getMonthBoundaries(2026, 1);
    expect(start.getMonth()).toBe(0);
    expect(end.getDate()).toBe(31);
  });

  it('defaults to India timezone (Asia/Kolkata)', () => {
    expect(INDIA_TIMEZONE).toBe('Asia/Kolkata');
    expect(DEFAULT_TIMEZONE).toBe('Asia/Kolkata');
  });

  it('correctly calculates Indian date when UTC is previous day (e.g. 02:00 AM IST is 20:30 UTC previous day)', () => {
    // 2026-10-02 20:30:00 UTC = 2026-10-03 02:00:00 IST
    const testDate = new Date('2026-10-02T20:30:00.000Z');
    const istDateStr = getLocalDateString(INDIA_TIMEZONE, testDate);
    expect(istDateStr).toBe('2026-10-03');
  });

  it('calculates the correct Monday for a date in Indian timezone', () => {
    // 2026-10-02 is a Friday -> Monday was 2026-09-28
    const monday = getWeekMondayDate('2026-10-02');
    expect(monday.toISOString().startsWith('2026-09-28')).toBe(true);

    // 2026-10-04 is Sunday -> Monday was 2026-09-28
    const sundayTest = getWeekMondayDate('2026-10-04');
    expect(sundayTest.toISOString().startsWith('2026-09-28')).toBe(true);

    // 2026-10-05 is Monday -> Monday is 2026-10-05
    const mondayTest = getWeekMondayDate('2026-10-05');
    expect(mondayTest.toISOString().startsWith('2026-10-05')).toBe(true);
  });

  it('retrieves current year and month for Indian timezone', () => {
    const { year, month } = getCurrentYearAndMonth();
    expect(year).toBeGreaterThanOrEqual(2024);
    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
  });

  it('computes today date string in Indian timezone', () => {
    const todayStr = getIndianTodayDateString();
    expect(todayStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
