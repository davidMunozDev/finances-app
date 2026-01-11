import type { RecurringExpense } from "@/data/recurring-expenses/types";

/**
 * Format frequency information into a readable Spanish string
 */
export function formatFrequency(expense: RecurringExpense): string {
  const { frequency, dow, dom, month, day } = expense;

  if (frequency === "weekly") {
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const dayName = dow ? days[dow % 7] : "";
    return `Semanal - ${dayName}`;
  }

  if (frequency === "monthly") {
    return `Mensual - Día ${dom}`;
  }

  if (frequency === "yearly") {
    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    const monthName = month ? months[month - 1] : "";
    return `Anual - ${day} ${monthName}`;
  }

  return frequency;
}

/**
 * Calculate the next payment date for a recurring expense
 */
export function getNextPaymentDate(expense: RecurringExpense): Date {
  const today = new Date();
  const { frequency, dow, dom, month, day } = expense;

  if (frequency === "weekly" && dow) {
    const result = new Date(today);
    const currentDay = result.getDay();
    const targetDay = dow % 7;
    let daysUntilTarget = targetDay - currentDay;

    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7;
    }

    result.setDate(result.getDate() + daysUntilTarget);
    return result;
  }

  if (frequency === "monthly" && dom) {
    const result = new Date(today);
    result.setDate(dom);

    if (result <= today) {
      result.setMonth(result.getMonth() + 1);
    }

    return result;
  }

  if (frequency === "yearly" && month && day) {
    const result = new Date(today.getFullYear(), month - 1, day);

    if (result <= today) {
      result.setFullYear(result.getFullYear() + 1);
    }

    return result;
  }

  return today;
}

/**
 * Validate recurring expense fields based on frequency
 */
export function validateRecurringFields(data: {
  frequency: "weekly" | "monthly" | "yearly";
  dow?: number;
  dom?: number;
  month?: number;
  day?: number;
}): { valid: boolean; error?: string } {
  const { frequency, dow, dom, month, day } = data;

  if (frequency === "weekly") {
    if (!dow || dow < 1 || dow > 7) {
      return { valid: false, error: "Día de la semana debe ser entre 1 y 7" };
    }
  }

  if (frequency === "monthly") {
    if (!dom || dom < 1 || dom > 28) {
      return { valid: false, error: "Día del mes debe ser entre 1 y 28" };
    }
  }

  if (frequency === "yearly") {
    if (!month || month < 1 || month > 12) {
      return { valid: false, error: "Mes debe ser entre 1 y 12" };
    }
    if (!day || day < 1 || day > 31) {
      return { valid: false, error: "Día debe ser entre 1 y 31" };
    }
  }

  return { valid: true };
}
