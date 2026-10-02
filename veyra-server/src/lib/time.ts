/** Timezone-aware date math utilities fixed to Indian Standard Time (Asia/Kolkata). */

export const INDIA_TIMEZONE = 'Asia/Kolkata';
export const DEFAULT_TIMEZONE = INDIA_TIMEZONE;

/**
 * Returns formatted calendar date YYYY-MM-DD in the given timezone (defaults to Asia/Kolkata).
 */
export function getLocalDateString(timezone: string = DEFAULT_TIMEZONE, dateObj: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(dateObj);
  } catch {
    // Fallback using IST offset (+05:30) if timezone formatting fails
    const utc = dateObj.getTime() + dateObj.getTimezoneOffset() * 60000;
    const istDate = new Date(utc + 5.5 * 3600000);
    return istDate.toISOString().split('T')[0];
  }
}

/**
 * Convenience helper returning today's date in Indian Standard Time (Asia/Kolkata).
 */
export function getIndianTodayDateString(dateObj: Date = new Date()): string {
  return getLocalDateString(INDIA_TIMEZONE, dateObj);
}

/**
 * Returns year and 1-based month in the given timezone (defaults to Asia/Kolkata).
 */
export function getCurrentYearAndMonth(timezone: string = DEFAULT_TIMEZONE): { year: number; month: number } {
  const dateStr = getLocalDateString(timezone);
  const [year, month] = dateStr.split('-').map(Number);
  return { year, month };
}

/**
 * Returns a UTC midnight Date representing the Monday of the week for dateStr in timezone (defaults to Asia/Kolkata).
 */
export function getWeekMondayDate(dateStr?: string, timezone: string = DEFAULT_TIMEZONE): Date {
  const targetDateStr = dateStr || getLocalDateString(timezone);
  const [y, m, d] = targetDateStr.split('-').map(Number);
  
  // Use noon UTC to avoid daylight saving or boundary jitter
  const anchor = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const day = anchor.getUTCDay(); // 0 = Sun, 1 = Mon... 6 = Sat
  const diff = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(anchor);
  monday.setUTCDate(anchor.getUTCDate() + diff);
  
  return new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate()));
}

/**
 * Shifts a YYYY-MM-DD date string by daysDelta days.
 */
export function shiftDateString(dateStr: string, daysDelta: number, timezone: string = DEFAULT_TIMEZONE): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + daysDelta, 12, 0, 0));
  return getLocalDateString(timezone, date);
}

export function getUserLocalDate(_timezone: string = DEFAULT_TIMEZONE): Date {
  const dateStr = getLocalDateString(_timezone);
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function getWeekStart(date: Date, _weekStartDay: number = 0): Date {
  return new Date(date);
}

export function getMonthBoundaries(year: number, month: number): { start: Date; end: Date } {
  return {
    start: new Date(year, month - 1, 1),
    end: new Date(year, month, 0),
  };
}
