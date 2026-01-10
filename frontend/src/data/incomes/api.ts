import { defaultServerInstance } from "@/config/servers";
import { endpoints } from "@/config/endpoints";
import type {
  Income,
  GetIncomesResponse,
  CreateIncomeBody,
  CreateIncomeResult,
  UpdateIncomeBody,
} from "./types";

/**
 * Get all incomes for the current budget cycle
 * @param budgetId - The budget ID
 * @returns Object with cycle info and array of incomes with amounts converted from string to number
 */
export async function getIncomes(budgetId: string): Promise<{
  cycle: GetIncomesResponse["cycle"];
  incomes: Income[];
}> {
  const response = await defaultServerInstance.get<GetIncomesResponse>(
    endpoints.incomes.getAll(budgetId)
  );

  // Transform: convert amount from string to number
  return {
    cycle: response.data.cycle,
    incomes: response.data.incomes.map((income) => ({
      ...income,
      amount:
        typeof income.amount === "string"
          ? parseFloat(income.amount)
          : income.amount,
    })),
  };
}

/**
 * Create a new income
 * @param budgetId - The budget ID
 * @param body - Income data
 * @returns Result with the created income ID and cycle info
 */
export async function createIncome(
  budgetId: string,
  body: CreateIncomeBody
): Promise<CreateIncomeResult> {
  const response = await defaultServerInstance.post<CreateIncomeResult>(
    endpoints.incomes.create(budgetId),
    body
  );
  return response.data;
}

/**
 * Update an existing income
 * @param budgetId - The budget ID
 * @param incomeId - The income ID to update
 * @param body - Updated income data
 */
export async function updateIncome(
  budgetId: string,
  incomeId: string,
  body: UpdateIncomeBody
): Promise<void> {
  await defaultServerInstance.put(
    endpoints.incomes.byId(budgetId, incomeId),
    body
  );
}

/**
 * Delete an income
 * @param budgetId - The budget ID
 * @param incomeId - The income ID to delete
 */
export async function deleteIncome(
  budgetId: string,
  incomeId: string
): Promise<void> {
  await defaultServerInstance.delete(
    endpoints.incomes.byId(budgetId, incomeId)
  );
}
