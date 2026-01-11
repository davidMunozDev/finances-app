export const endpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
    delete: "/auth/delete",
    refresh: "/auth/refresh",
    onboarding: "/auth/onboarding",
  },
  budgets: {
    root: "/budgets",
    byId: (id: string) => `/budgets/${id}`,
  },
  categories: {
    root: "/categories",
    byId: (id: string) => `/categories/${id}`,
  },
  expenses: {
    getAll: (budgetId: string) => `/budgets/${budgetId}/expenses`,
    create: (budgetId: string) => `/budgets/${budgetId}/expenses`,
  },
  incomes: {
    getAll: (budgetId: string) => `/budgets/${budgetId}/incomes`,
    create: (budgetId: string) => `/budgets/${budgetId}/incomes`,
    byId: (budgetId: string, incomeId: string) =>
      `/budgets/${budgetId}/incomes/${incomeId}`,
  },
  provisions: {
    getAll: (budgetId: string) => `/budgets/${budgetId}/provisions`,
    create: (budgetId: string) => `/budgets/${budgetId}/provisions`,
    createBulk: (budgetId: string) => `/budgets/${budgetId}/provisions/bulk`,
    byId: (budgetId: string, provisionId: string) =>
      `/budgets/${budgetId}/provisions/${provisionId}`,
  },
  recurringExpenses: {
    getAll: (budgetId: string) => `/budgets/${budgetId}/recurring-expenses`,
    create: (budgetId: string) => `/budgets/${budgetId}/recurring-expenses`,
    byId: (budgetId: string, recurringId: string) =>
      `/budgets/${budgetId}/recurring-expenses/${recurringId}`,
  },
  transactions: {
    addManual: (budgetId: string) => `/budgets/${budgetId}/transactions`,
    currentSummary: (budgetId: string) => `/budgets/${budgetId}/summary`,
  },
  assistant: {
    query: "/assistant/query",
  },
};
