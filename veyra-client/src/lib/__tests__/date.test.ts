/** Unit tests for Indian Standard Time (Asia/Kolkata) date helpers. */
import { describe, it, expect } from 'vitest';
import {
  INDIA_TIMEZONE,
  DEFAULT_TIMEZONE,
  getIndianTodayDateString,
  shiftDateString,
  getWeekMondayDateString,
  getCurrentYearAndMonth,
  formatDate,
  formatTime,
  isToday,
} from '../date';

describe('Indian Timezone Date Helpers', () => {
  it('has India timezone as default', () => {
    expect(INDIA_TIMEZONE).toBe('Asia/Kolkata');
    expect(DEFAULT_TIMEZONE).toBe('Asia/Kolkata');
  });

  it('correctly returns date in IST when UTC is previous day (02:00 AM IST = 20:30 UTC previous day)', () => {
    const utcDate = new Date('2026-10-02T20:30:00.000Z');
    const istDate = getIndianTodayDateString(utcDate);
    expect(istDate).toBe('2026-10-03');
  });

  it('shifts date strings reliably without UTC drift', () => {
    expect(shiftDateString('2026-10-02', 1)).toBe('2026-10-03');
    expect(shiftDateString('2026-10-02', -1)).toBe('2026-10-01');
    expect(shiftDateString('2026-10-01', -1)).toBe('2026-09-30');
    expect(shiftDateString('2026-10-02', 14)).toBe('2026-10-16');
  });

  it('calculates the Monday of the week in IST', () => {
    // 2026-10-02 is a Friday -> Monday is 2026-09-28
    expect(getWeekMondayDateString('2026-10-02')).toBe('2026-09-28');

    // 2026-10-05 is a Monday -> Monday is 2026-10-05
    expect(getWeekMondayDateString('2026-10-05')).toBe('2026-10-05');

    // 2026-10-04 is a Sunday -> Monday is 2026-09-28
    expect(getWeekMondayDateString('2026-10-04')).toBe('2026-09-28');
  });

  it('returns current year and month in IST', () => {
    const { year, month } = getCurrentYearAndMonth();
    expect(year).toBeGreaterThanOrEqual(2024);
    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
  });

  it('formats dates in Indian locale', () => {
    const formatted = formatDate('2026-10-02');
    expect(formatted).toMatch(/2/);
    expect(formatted).toMatch(/Oct/);
    expect(formatted).toMatch(/2026/);
  });

  it('formats time in Indian 12-hour format with AM/PM', () => {
    const testDate = new Date('2026-10-02T04:30:00.000Z'); // 10:00 AM IST
    const formattedTime = formatTime(testDate);
    expect(formattedTime).toMatch(/10:00/);
    expect(formattedTime).toMatch(/am/i);
  });

  it('evaluates isToday accurately in Indian timezone', () => {
    const todayStr = getIndianTodayDateString();
    expect(isToday(todayStr)).toBe(true);
    expect(isToday(shiftDateString(todayStr, -1))).toBe(false);
    expect(isToday(shiftDateString(todayStr, 1))).toBe(false);
  });
});
