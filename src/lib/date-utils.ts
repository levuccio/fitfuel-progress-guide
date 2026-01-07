import { getISOWeek, getISOWeekYear, addWeeks, subWeeks, format, startOfWeek, endOfWeek, isBefore } from "date-fns";
import { toZonedTime } from "date-fns-tz"; // Updated import to toZonedTime

// Helper to get the user's current timezone
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Computes the ISO week ID (YYYY-Www) for a given date and timezone.
 * Week starts Monday 00:00:00, ends Sunday 23:59:59.
 */
export function getWeekId(date: Date, tz: string): string {
  const zonedDate = toZonedTime(date, tz); // Updated usage to toZonedTime
  const year = getISOWeekYear(zonedDate);
  const week = getISOWeek(zonedDate);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/**
 * Helper to convert YYYY-Www to a Date object (e.g., the Monday of that week).
 * This is crucial for consistent date-fns operations.
 */
function weekIdToDate(weekId: string): Date {
  const [yearStr, weekStr] = weekId.split('-W');
  const year = parseInt(yearStr);
  const week = parseInt(weekStr);
  // ISO week 1 contains Jan 4th. We can find the Monday of week 1, then add (week-1) weeks.
  const jan4 = new Date(year, 0, 4);
  const startOfFirstISOWeek = startOfWeek(jan4, { weekStartsOn: 1 });
  return addWeeks(startOfFirstISOWeek, week - 1);
}

/**
 * Returns the previous week's ID.
 */
export function prevWeekId(weekId: string): string {
  const dateInWeek = weekIdToDate(weekId);
  const prevWeekDate = subWeeks(dateInWeek, 1);
  return getWeekId(prevWeekDate, 'UTC'); // Use UTC for internal consistency
}


/**
 * Returns an array of week IDs between two week IDs (exclusive of start, inclusive of end).
 * E.g., getWeekIdsBetween("2023-W01", "2023-W03") => ["2023-W02", "2023-W03"]
 * If startWeekId is undefined, it returns [endWeekId].
 */
export function getWeekIdsBetween(startWeekId: string | undefined, endWeekId: string): string[] {
  const weekIds: string[] = [];
  let currentWeekDate: Date;

  if (!startWeekId) {
    // If no startWeekId, we want to include the endWeekId itself.
    // To do this with the loop structure, we start from the week *before* endWeekId.
    currentWeekDate = subWeeks(weekIdToDate(endWeekId), 1);
  } else {
    currentWeekDate = weekIdToDate(startWeekId);
  }

  const endWeekDate = weekIdToDate(endWeekId);

  // Safety break for infinite loops
  let iterationCount = 0;
  const MAX_ITERATIONS = 100;

  while (isBefore(currentWeekDate, endWeekDate) && iterationCount < MAX_ITERATIONS) {
    currentWeekDate = addWeeks(currentWeekDate, 1);
    weekIds.push(getWeekId(currentWeekDate, 'UTC'));
    iterationCount++;
  }

  return weekIds;
}