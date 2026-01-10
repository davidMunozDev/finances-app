import { ApiErrorResponse, CategoryWithProvisions } from "./types";

export function getErrorMessage(
  error: unknown,
  defaultMessage: string
): string {
  if (error && typeof error === "object" && "response" in error) {
    const apiError = error as ApiErrorResponse;
    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }
  }
  return defaultMessage;
}

export function getCategoryTotal(category: CategoryWithProvisions): number {
  return category.provisions.reduce((sum, prov) => sum + prov.amount, 0);
}
