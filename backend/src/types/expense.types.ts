export type ExpenseCreateResult =
  | { kind: "transaction"; id: number }
  | { kind: "recurring_rule"; id: number };
