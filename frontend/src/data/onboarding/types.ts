// Tipos para cada paso del onboarding
export type UserData = {
  full_name: string;
  default_currency: string;
};

export type BudgetData = {
  name: string;
  reset_type: "weekly" | "monthly" | "yearly";
  reset_dow?: number;
  reset_dom?: number;
  reset_month?: number;
  reset_day?: number;
};

export type Income = {
  description: string;
  amount: number;
};

export type OnboardingCategory = {
  name: string;
  icon?: string;
};

export type FixedExpense = {
  category_name: string;
  name: string;
  amount: number;
};

export type OnboardingData = {
  user: UserData | null;
  budget: BudgetData | null;
  incomes: Income[];
  categories: OnboardingCategory[];
  fixed_expenses: FixedExpense[];
};
