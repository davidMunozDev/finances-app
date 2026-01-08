export interface RecurringExpense {
  id: number;
  budget_id: number;
  category_id: number;
  name: string;
  amount: number;
  frequency: "weekly" | "monthly" | "yearly";
  dow: number | null; // day of week (1-7) for weekly
  dom: number | null; // day of month (1-28) for monthly
  month: number | null; // month (1-12) for yearly
  day: number | null; // day (1-31) for yearly
}

export interface CreateRecurringExpenseWeekly {
  category_id: number;
  name: string;
  amount: number;
  frequency: "weekly";
  dow: number; // 1-7
}

export interface CreateRecurringExpenseMonthly {
  category_id: number;
  name: string;
  amount: number;
  frequency: "monthly";
  dom: number; // 1-28
}

export interface CreateRecurringExpenseYearly {
  category_id: number;
  name: string;
  amount: number;
  frequency: "yearly";
  month: number; // 1-12
  day: number; // 1-31
}

export type CreateRecurringExpenseBody =
  | CreateRecurringExpenseWeekly
  | CreateRecurringExpenseMonthly
  | CreateRecurringExpenseYearly;

export interface CreateRecurringExpenseResult {
  id: number;
}
