export type Budget = {
  id: number;
  user_id: number;
  name: string;
  currency: string;
  reset_type: "weekly" | "monthly" | "yearly";
  reset_dow: number | null;
  reset_dom: number | null;
  reset_month: number | null;
  reset_day: number | null;
  is_active: 0 | 1;
};

export type CreateBudgetBody = {
  name: string;
  currency: string;
  reset_type: "weekly" | "monthly" | "yearly";
  reset_dow?: number;
  reset_dom?: number;
  reset_month?: number;
  reset_day?: number;
};

export type UpdateBudgetBody = {
  name?: string;
  currency?: string;
  reset_type?: "weekly" | "monthly" | "yearly";
  reset_dow?: number;
  reset_dom?: number;
  reset_month?: number;
  reset_day?: number;
  is_active?: 0 | 1;
};
