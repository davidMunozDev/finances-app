import { defaultServerInstance } from "@/config/servers";
import { endpoints } from "@/config/endpoints";
import type { Budget, CreateBudgetBody, UpdateBudgetBody } from "./types";

/**
 * Create a new budget
 */
export async function createBudget(
  data: CreateBudgetBody
): Promise<{ id: number }> {
  const response = await defaultServerInstance.post<{ id: number }>(
    endpoints.budgets.root,
    data
  );
  return response.data;
}

/**
 * Update a budget
 */
export async function updateBudget(
  id: number,
  data: UpdateBudgetBody
): Promise<Budget> {
  const response = await defaultServerInstance.put<Budget>(
    endpoints.budgets.byId(id.toString()),
    data
  );
  return response.data;
}

/**
 * Delete a budget
 */
export async function deleteBudget(id: number): Promise<void> {
  await defaultServerInstance.delete(endpoints.budgets.byId(id.toString()));
}
