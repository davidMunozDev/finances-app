export type FixedExpenseRow = {
  id: number;
  budget_id: number;
  category_id: number;
  name: string;
  amount: string; // DECIMAL suele venir como string
};

export type CreateFixedBody = {
  category_id: number;
  name: string;
  amount: number;
};
