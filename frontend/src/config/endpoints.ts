export const endpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
    delete: "/auth/delete",
    refresh: "/auth/refresh",
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
    create: (budgetId: string) => `/budgets/${budgetId}/expenses`,
  },
  fixedExpenses: {
    getAll: (budgetId: string) => `/budgets/${budgetId}/fixed-expenses`,
    create: (budgetId: string) => `/budgets/${budgetId}/fixed-expenses`,
    createBulk: (budgetId: string) =>
      `/budgets/${budgetId}/fixed-expenses/bulk`,
    byId: (budgetId: string, fixedId: string) =>
      `/budgets/${budgetId}/fixed-expenses/${fixedId}`,
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
};
