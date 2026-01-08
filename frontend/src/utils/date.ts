/**
 * Date utility functions for consistent date handling across the application.
 * All functions work with local time to avoid timezone issues.
 */

/**
 * Create a date object set to midnight (00:00:00.000) in local time
 * @param year - Full year (e.g., 2026)
 * @param month - Month (1-12)
 * @param day - Day of month (1-31)
 * @returns Date object at midnight local time
 */
export function createLocalDate(
  year: number,
  month: number,
  day: number
): Date {
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Reset a date object to midnight (00:00:00.000) in local time
 * @param date - Date to reset
 * @returns New Date object at midnight
 */
export function resetToMidnight(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get today's date at midnight in local time
 * @returns Date object representing today at 00:00:00.000
 */
export function getToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Parse an ISO date string (YYYY-MM-DD) to a Date object at midnight local time
 * This avoids timezone issues when creating dates from strings
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns Date object at midnight local time
 */
export function parseISODate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return createLocalDate(year, month, day);
}

/**
 * Format a Date object to ISO date string (YYYY-MM-DD)
 * Uses local date components to avoid timezone shifts
 * @param date - Date object
 * @returns ISO date string (YYYY-MM-DD)
 */
export function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Compare two dates (date-only, ignoring time)
 * @param date1 - First date
 * @param date2 - Second date
 * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareDates(date1: Date, date2: Date): number {
  const d1 = resetToMidnight(date1);
  const d2 = resetToMidnight(date2);

  if (d1.getTime() < d2.getTime()) return -1;
  if (d1.getTime() > d2.getTime()) return 1;
  return 0;
}

/**
 * Check if two dates are the same day (ignoring time)
 * @param date1 - First date
 * @param date2 - Second date
 * @returns true if same day, false otherwise
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Add days to a date
 * @param date - Base date
 * @param days - Number of days to add (can be negative)
 * @returns New date with days added
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add months to a date
 * @param date - Base date
 * @param months - Number of months to add (can be negative)
 * @returns New date with months added
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}
