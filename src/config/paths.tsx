const ROOTS = {
  AUTH: "/auth",
  PLATFORM: "/platform",
};

export const PATHS = {
  ROOTS,
  SIGN_IN: `${ROOTS.AUTH}/sign-in`,
  SIGN_UP: `${ROOTS.AUTH}/sign-up`,
  HOME: `${ROOTS.PLATFORM}/dashboard`,
  ONBOARDING: {
    ROOT: `${ROOTS.PLATFORM}/onboarding`,
    USER: `${ROOTS.PLATFORM}/onboarding/user`,
    BUDGET: `${ROOTS.PLATFORM}/onboarding/budget`,
    INCOMES: `${ROOTS.PLATFORM}/onboarding/incomes`,
    OUTCOMES: `${ROOTS.PLATFORM}/onboarding/outcomes`,
    SUMMARY: `${ROOTS.PLATFORM}/onboarding/summary`,
  },
};
