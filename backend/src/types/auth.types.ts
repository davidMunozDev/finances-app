export type RegisterBody = {
  email: string;
  password: string;
  full_name?: string;
  default_currency?: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type AuthUserResponse = {
  id: number;
  email: string;
  full_name: string | null;
  default_currency: string;
  onboarding_completed: boolean;
};

export type AuthResponse = {
  token: string;
  user: AuthUserResponse;
};

export type OnboardingDataBody = {
  user: {
    full_name: string;
    default_currency: string;
  };
  budget: {
    name: string;
    reset_type: "weekly" | "monthly" | "yearly";
    reset_dow?: number;
    reset_dom?: number;
    reset_month?: number;
    reset_day?: number;
  };
  incomes: Array<{
    description: string;
    amount: number;
  }>;
  categories: Array<{
    name: string;
    icon?: string;
  }>;
  provisions: Array<{
    category_name: string;
    name: string;
    amount: number;
  }>;
};
