import { getISOWeek, getISOWeekYear, addWeeks, subWeeks, format, startOfWeek, endOfWeek } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

// Helper to get the user's current timezone
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Computes the ISO week ID (YYYY-Www) for a given date and timezone.
 * Week starts Monday 00:00:00, ends Sunday 23:59:59.
 */
export function getWeekId(date: Date, tz: string): string {
  const zonedDate = utcToZonedTime(date, tz);
  const year = getISOWeekYear(zonedDate);
  const week = getISOWeek(zonedDate);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/**
 * Returns the previous week's ID.
 */
export function prevWeekId(weekId: string): string {
  const [yearStr, weekStr] = weekId.split('-W');
  const year = parseInt(yearStr);
  const week = parseInt(weekStr);

  // Create a date within that week (e.g., Wednesday to avoid edge cases with week start/end)
  // We need a reference date to subtract a week using date-fns
  // For ISO weeks, week 1 always contains Jan 4th.
  // So, we can construct a date like: new Date(year, 0, 4 + (week - 1) * 7)
  // Then subtract a week.
  const dateInWeek = new Date(year, 0, 4); // Jan 4th of the year
  const firstWeekIdOfYear = getWeekId(dateInWeek, 'UTC'); // Get weekId for Jan 4th

  let currentWeekStartDate: Date;
  if (firstWeekIdOfYear === weekId) {
    // If it's the first week of the year, we need to go back to the last week of the previous year
    currentWeekStartDate = startOfWeek(new Date(year, 0, 1), { weekStartsOn: 1 });
  } else {
    // Otherwise, calculate a date within the target week
    currentWeekStartDate = addWeeks(startOfWeek(new Date(year, 0, 4), { weekStartsOn: 1 }), week - getISOWeek(new Date(year, 0, 4)));
  }
  
  const prevWeekDate = subWeeks(currentWeekStartDate, 1);
  return getWeekId(prevWeekDate, 'UTC'); // Use UTC for internal calculation consistency, as getWeekId handles tz
}


/**
 * Returns an array of week IDs between two week IDs (exclusive of start, inclusive of end).
 * E.g., getWeekIdsBetween("2023-W01", "2023-W03") => ["2023-W02", "2023-W03"]
 */
export function getWeekIdsBetween(startWeekId: string | undefined, endWeekId: string): string[] {
  if (!startWeekId) {
    // If no lastFinalizedWeekId, we start from the beginning of the endWeekId
    return [endWeekId];
  }

  const weekIds: string[] = [];
  let currentWeek = startWeekId;

  // Safety break for infinite loops in case of bad input
  let iterationCount = 0;
  const MAX_ITERATIONS = 100; // Prevent infinite loops for very distant weeks

  while (currentWeek !== endWeekId && iterationCount < MAX_ITERATIONS) {
    // Calculate the next week ID
    const [yearStr, weekStr] = currentWeek.split('-W');
    const year = parseInt(yearStr);
    const week = parseInt(weekStr);

    // Get a date within the current week (e.g., Wednesday)
    const dateInCurrentWeek = new Date(year, 0, 4); // Jan 4th of the year
    const firstWeekIdOfYear = getWeekId(dateInCurrentWeek, 'UTC');

    let currentWeekStartDate: Date;
    if (firstWeekIdOfYear === currentWeek) {
      currentWeekStartDate = startOfWeek(new Date(year, 0, 1), { weekStartsOn: 1 });
    } else {
      currentWeekStartDate = addWeeks(startOfWeek(new Date(year, 0, 4), { weekStartsOn: 1 }), week - getISOWeek(new Date(year, 0, 4)));
    }

    const nextWeekDate = addWeeks(currentWeekStartDate, 1);
    const nextWeekId = getWeekId(nextWeekDate, 'UTC'); // Use UTC for internal calculation consistency

    weekIds.push(nextWeekId);
    currentWeek = nextWeekId;
    iterationCount++;
  }

  return weekIds;
}