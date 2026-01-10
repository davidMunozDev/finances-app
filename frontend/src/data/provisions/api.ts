import { defaultServerInstance } from "@/config/servers";
import { endpoints } from "@/config/endpoints";
import type {
  Provision,
  ProvisionBackendRow,
  CreateProvisionBody,
  CreateProvisionResult,
  CreateProvisionBulkBody,
  CreateProvisionBulkResult,
} from "./types";

/**
 * Get all provisions for a budget
 * @param budgetId - The budget ID
 * @returns Array of provisions with amounts converted from string to number
 */
export async function getProvisions(budgetId: string): Promise<Provision[]> {
  const response = await defaultServerInstance.get<ProvisionBackendRow[]>(
    endpoints.provisions.getAll(budgetId)
  );

  // Transform: convert amount from string to number
  return response.data.map((provision) => ({
    ...provision,
    amount:
      typeof provision.amount === "string"
        ? parseFloat(provision.amount)
        : provision.amount,
  }));
}

/**
 * Create a new provision
 * @param budgetId - The budget ID
 * @param body - Provision data
 * @returns Result with the created provision ID
 */
export async function createProvision(
  budgetId: string,
  body: CreateProvisionBody
): Promise<CreateProvisionResult> {
  const response = await defaultServerInstance.post<CreateProvisionResult>(
    endpoints.provisions.create(budgetId),
    body
  );
  return response.data;
}

/**
 * Create multiple provisions at once
 * @param budgetId - The budget ID
 * @param body - Bulk provision data
 * @returns Result with array of created provision IDs
 */
export async function createProvisionBulk(
  budgetId: string,
  body: CreateProvisionBulkBody
): Promise<CreateProvisionBulkResult> {
  const response = await defaultServerInstance.post<CreateProvisionBulkResult>(
    endpoints.provisions.createBulk(budgetId),
    body
  );
  return response.data;
}

/**
 * Delete a provision
 * @param budgetId - The budget ID
 * @param provisionId - The provision ID to delete
 */
export async function deleteProvision(
  budgetId: string,
  provisionId: string
): Promise<void> {
  await defaultServerInstance.delete(
    endpoints.provisions.byId(budgetId, provisionId)
  );
}

/**
 * Update a provision
 * @param budgetId - The budget ID
 * @param provisionId - The provision ID to update
 * @param body - Updated provision data
 */
export async function updateProvision(
  budgetId: string,
  provisionId: string,
  body: { name: string; amount: number; category_id: number }
): Promise<void> {
  await defaultServerInstance.put(
    endpoints.provisions.byId(budgetId, provisionId),
    body
  );
}
