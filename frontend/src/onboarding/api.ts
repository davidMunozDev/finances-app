import { defaultServerInstance } from "@/config/servers";
import { endpoints } from "@/config/endpoints";
import { mutate } from "swr";
import type { AuthUser } from "@/data/auth/types";
import type { OnboardingData } from "@/data/onboarding/types";

export type CompleteOnboardingBody = {
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
  fixed_expenses: Array<{
    category_name: string;
    name: string;
    amount: number;
  }>;
};

/**
 * Complete user onboarding process
 */
export async function completeOnboarding(
  data: OnboardingData
): Promise<AuthUser> {
  if (!data.user || !data.budget) {
    throw new Error("User and budget data are required");
  }

  const body: CompleteOnboardingBody = {
    user: data.user,
    budget: data.budget,
    incomes: data.incomes,
    categories: data.categories,
    fixed_expenses: data.fixed_expenses,
  };

  const response = await defaultServerInstance.patch<AuthUser>(
    endpoints.auth.onboarding,
    body
  );

  mutate(endpoints.auth.me);

  return response.data;
}
