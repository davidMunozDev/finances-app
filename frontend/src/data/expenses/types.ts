export interface Expense {
  id: number;
  category_id: number | null;
  category_name: string | null;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  type: "expense";
  source: "fixed" | "recurring" | "manual";
}

export interface ExpenseFilters {
  all?: boolean;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

export interface CreateExpenseOneTime {
  type: "one_time";
  category_id: number;
  amount: number;
  description?: string;
  date?: string; // YYYY-MM-DD
}

export interface CreateExpenseRecurring {
  type: "recurring";
  category_id: number;
  name: string;
  amount: number;
  schedule: {
    frequency: "weekly" | "monthly" | "yearly";
    dow?: number; // day of week (1-7) for weekly
    dom?: number; // day of month (1-28) for monthly
    month?: number; // month (1-12) for yearly
    day?: number; // day (1-31) for yearly
  };
}

export type CreateExpenseBody = CreateExpenseOneTime | CreateExpenseRecurring;

export interface CreateExpenseResult {
  kind: "transaction" | "recurring_rule";
  id: number;
}
