const ROOTS = {
  AUTH: "/auth",
  PLATFORM: "/platform",
};

export const paths = {
  auth: {
    signIn: `${ROOTS.AUTH}/sign-in`,
    signUp: `${ROOTS.AUTH}/sign-up`,
  },
  platform: {
    home: `${ROOTS.PLATFORM}/dashboard`,
    addExpense: `${ROOTS.PLATFORM}/add-expense`,
    budget: `${ROOTS.PLATFORM}/budget`,
    onboarding: {
      root: `${ROOTS.PLATFORM}/onboarding`,
      user: `${ROOTS.PLATFORM}/onboarding/user`,
      budget: `${ROOTS.PLATFORM}/onboarding/budget`,
      incomes: `${ROOTS.PLATFORM}/onboarding/incomes`,
      outcomes: `${ROOTS.PLATFORM}/onboarding/outcomes`,
      summary: `${ROOTS.PLATFORM}/onboarding/summary`,
    },
  },
};
