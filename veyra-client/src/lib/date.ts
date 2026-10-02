/** Timezone-aware date helpers fixed to Indian Standard Time (Asia/Kolkata). */

export const INDIA_TIMEZONE = 'Asia/Kolkata';
export const DEFAULT_TIMEZONE = INDIA_TIMEZONE;

/**
 * Returns today's calendar date string in YYYY-MM-DD in India (IST, Asia/Kolkata).
 */
export function getIndianTodayDateString(dateObj: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: INDIA_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(dateObj);
  } catch {
    const utc = dateObj.getTime() + dateObj.getTimezoneOffset() * 60000;
    const istDate = new Date(utc + 5.5 * 3600000);
    return istDate.toISOString().split('T')[0];
  }
}

/**
 * Shifts a YYYY-MM-DD date string by daysDelta days in Indian Standard Time.
 */
export function shiftDateString(dateStr: string, daysDelta: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const anchor = new Date(Date.UTC(y, m - 1, d + daysDelta, 12, 0, 0));
  return getIndianTodayDateString(anchor);
}

/**
 * Returns the Monday YYYY-MM-DD date string for the week containing the given date in IST.
 */
export function getWeekMondayDateString(dateStr?: string): string {
  const target = dateStr || getIndianTodayDateString();
  const [y, m, d] = target.split('-').map(Number);
  const anchor = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const day = anchor.getUTCDay(); // 0 = Sun, 1 = Mon... 6 = Sat
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(anchor);
  monday.setUTCDate(anchor.getUTCDate() + diff);
  return getIndianTodayDateString(monday);
}

/**
 * Returns the current year and 1-based month in Indian Standard Time.
 */
export function getCurrentYearAndMonth(): { year: number; month: number } {
  const today = getIndianTodayDateString();
  const [year, month] = today.split('-').map(Number);
  return { year, month };
}

/**
 * Formats a Date object or ISO string in Indian locale and Indian Standard Time.
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: INDIA_TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(d);
}

/**
 * Formats time in Indian Standard Time (12-hour format with AM/PM).
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: INDIA_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

/**
 * Checks if a given Date or YYYY-MM-DD string is today in Indian Standard Time.
 */
export function isToday(date: Date | string): boolean {
  if (typeof date === 'string') {
    return date === getIndianTodayDateString();
  }
  return getIndianTodayDateString(date) === getIndianTodayDateString();
}
