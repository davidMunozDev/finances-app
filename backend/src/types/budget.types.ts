export type ResetType = "weekly" | "monthly" | "yearly";

export type BudgetRow = {
  id: number;
  user_id: number;
  name: string;
  currency: string;
  reset_type: ResetType;
  reset_dow: number | null; // 1..7
  reset_dom: number | null; // 1..31 (recomendado 1..28)
  reset_month: number | null; // 1..12
  reset_day: number | null; // 1..31
  is_active: 0 | 1;
};

export type CreateBudgetBody =
  | { name: string; reset_type: "weekly"; reset_dow: number } // 1..7
  | { name: string; reset_type: "monthly"; reset_dom: number } // 1..28/31
  | {
      name: string;
      reset_type: "yearly";
      reset_month: number;
      reset_day: number;
    }; // 1..12, 1..31

export type UpdateBudgetBody = Partial<CreateBudgetBody> & { name?: string };
