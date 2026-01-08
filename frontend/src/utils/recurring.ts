import type { RecurringExpense } from "@/data/recurring-expenses";
import {
  getToday,
  addMonths,
  addDays,
  createLocalDate,
  formatISODate,
  resetToMidnight,
} from "./date";

export interface FutureTransaction {
  id: string; // unique identifier for the future transaction
  recurring_id: number;
  category_id: number;
  category_name: string | null;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  type: "expense";
  source: "recurring";
  isFuture: true;
  frequency: "weekly" | "monthly" | "yearly";
}

/**
 * Calculate the next occurrence date for a weekly recurring expense
 */
function getNextWeeklyDate(dow: number, fromDate: Date): Date {
  const currentDow = fromDate.getDay() === 0 ? 7 : fromDate.getDay(); // Convert Sunday from 0 to 7
  const daysUntilNext = (dow - currentDow + 7) % 7;

  const result = resetToMidnight(fromDate);

  if (daysUntilNext === 0) {
    // If today is the target day, get next week
    return addDays(result, 7);
  } else {
    return addDays(result, daysUntilNext);
  }
}

/**
 * Calculate the next occurrence date for a monthly recurring expense
 */
function getNextMonthlyDate(dom: number, fromDate: Date): Date {
  const year = fromDate.getFullYear();
  const month = fromDate.getMonth() + 1; // Convert to 1-12

  // Create date for this month
  let result = createLocalDate(year, month, dom);

  // If we've already passed this day this month, move to next month
  if (result <= fromDate) {
    const nextMonthDate = addMonths(result, 1);
    result = createLocalDate(
      nextMonthDate.getFullYear(),
      nextMonthDate.getMonth() + 1,
      dom
    );
  }

  return result;
}

/**
 * Calculate the next occurrence date for a yearly recurring expense
 */
function getNextYearlyDate(month: number, day: number, fromDate: Date): Date {
  const currentYear = fromDate.getFullYear();
  let result = createLocalDate(currentYear, month, day);

  // If this date has already passed this year, move to next year
  if (result <= fromDate) {
    result = createLocalDate(currentYear + 1, month, day);
  }

  return result;
}

/**
 * Generate future transaction dates for a recurring expense
 * @param recurring - The recurring expense definition
 * @param monthsAhead - Number of months to generate (default: 6)
 * @param categoryName - Optional category name to include
 * @returns Array of future transactions
 */
export function generateFutureTransactions(
  recurring: RecurringExpense,
  monthsAhead: number = 6,
  categoryName?: string
): FutureTransaction[] {
  const today = getToday();
  const endDate = addMonths(today, monthsAhead);

  const transactions: FutureTransaction[] = [];
  let currentDate = new Date(today);

  while (currentDate <= endDate) {
    let nextDate: Date | null = null;

    switch (recurring.frequency) {
      case "weekly":
        if (recurring.dow === null) break;
        nextDate = getNextWeeklyDate(recurring.dow, currentDate);
        break;

      case "monthly":
        if (recurring.dom === null) break;
        nextDate = getNextMonthlyDate(recurring.dom, currentDate);
        break;

      case "yearly":
        if (recurring.month === null || recurring.day === null) break;
        nextDate = getNextYearlyDate(
          recurring.month,
          recurring.day,
          currentDate
        );
        break;

      default:
        return transactions;
    }

    if (!nextDate || nextDate > endDate) {
      break;
    }

    const dateStr = formatISODate(nextDate);

    const futureTransaction: FutureTransaction = {
      id: `future-${recurring.id}-${dateStr}`,
      recurring_id: recurring.id,
      category_id: recurring.category_id,
      category_name: categoryName || null,
      description: recurring.name,
      amount: recurring.amount,
      date: dateStr,
      type: "expense" as const,
      source: "recurring" as const,
      isFuture: true as const,
      frequency: recurring.frequency,
    };

    transactions.push(futureTransaction);

    currentDate = addDays(nextDate, 1); // Move to next day to avoid infinite loop
  }

  return transactions;
}

/**
 * Generate all future transactions from an array of recurring expenses
 * @param recurringExpenses - Array of recurring expenses
 * @param monthsAhead - Number of months to generate (default: 6)
 * @param categories - Optional map of category IDs to names
 * @returns Array of all future transactions
 */
export function generateAllFutureTransactions(
  recurringExpenses: RecurringExpense[],
  monthsAhead: number = 6,
  categories?: Map<number, string>
): FutureTransaction[] {
  const allFuture: FutureTransaction[] = [];

  for (const recurring of recurringExpenses) {
    const categoryName = categories?.get(recurring.category_id);
    const future = generateFutureTransactions(
      recurring,
      monthsAhead,
      categoryName
    );
    allFuture.push(...future);
  }

  // Sort by date
  allFuture.sort((a, b) => a.date.localeCompare(b.date));

  return allFuture;
}
