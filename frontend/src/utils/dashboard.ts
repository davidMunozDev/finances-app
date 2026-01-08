import type { Transaction } from "@/dashboard/types";

/**
 * Format a Date object to YYYY-MM-DD string
 * @param date - Date object to format
 * @returns Formatted date string (YYYY-MM-DD)
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface ProcessedSpendingData {
  dailyData: Array<{ date: string; amount: number }>;
  dailyExpenses: Record<string, number>;
  totalSpent: number;
  average: number;
}

/**
 * Process transactions to generate daily spending data, totals, and averages
 * @param transactions - Array of transactions from the API
 * @param startDate - Start date of the budget cycle (YYYY-MM-DD)
 * @param endDate - End date of the budget cycle (YYYY-MM-DD)
 * @returns Processed spending data with daily amounts and aggregates
 */
export function processSpendingData(
  transactions: Transaction[],
  startDate: string,
  endDate: string
): ProcessedSpendingData {
  // Filter only expenses
  const expenses = transactions.filter((t) => t.type === "expense");

  // Group expenses by date
  const expensesByDate: Record<string, number> = {};
  expenses.forEach((expense) => {
    // Convert the date to YYYY-MM-DD format (local date)
    const date = new Date(expense.date);
    const dateStr = formatDateToString(date);
    expensesByDate[dateStr] = (expensesByDate[dateStr] || 0) + expense.amount;
  });

  // Calculate total spent
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Generate array of all dates in the cycle
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates: string[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    dates.push(dateStr);
  }

  // Calculate number of days in the period
  const daysInPeriod = dates.length;
  const average = daysInPeriod > 0 ? totalSpent / daysInPeriod : 0;

  // Generate daily accumulated data for the chart
  let accumulated = 0;
  const dailyData = dates.map((date) => {
    const dailyAmount = expensesByDate[date] || 0;
    accumulated += dailyAmount;
    return { date, amount: accumulated };
  });

  return {
    dailyData,
    dailyExpenses: expensesByDate,
    totalSpent,
    average,
  };
}

/**
 * Format period label from cycle dates
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Formatted period string (e.g., "11 dic - 10 ene")
 */
export function formatPeriodLabel(startDate: string, endDate: string): string {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const formatter = new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
    });

    const startFormatted = formatter.format(start);
    const endFormatted = formatter.format(end);

    return `${startFormatted} - ${endFormatted}`;
  } catch (error) {
    console.warn("Invalid date format", error);
    return `${startDate} - ${endDate}`;
  }
}
