export type Frequency = "weekly" | "monthly" | "yearly";

export type RecurringExpenseRow = {
  id: number;
  budget_id: number;
  category_id: number;
  name: string;
  amount: string;
  frequency: Frequency;
  dow: number | null;
  dom: number | null;
  month: number | null;
  day: number | null;
};

export type CreateRecurringBody =
  | {
      category_id: number;
      name: string;
      amount: number;
      frequency: "weekly";
      dow: number;
    }
  | {
      category_id: number;
      name: string;
      amount: number;
      frequency: "monthly";
      dom: number;
    }
  | {
      category_id: number;
      name: string;
      amount: number;
      frequency: "yearly";
      month: number;
      day: number;
    };
