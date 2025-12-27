import { defaultServerInstance } from "@/config/servers";
import { endpoints } from "@/config/endpoints";
import type { Category, CreateCategoryBody, UpdateCategoryBody } from "./types";

/**
 * Get all categories for the current user
 */
export async function getCategories(): Promise<Category[]> {
  const response = await defaultServerInstance.get<Category[]>(
    endpoints.categories.root
  );
  return response.data;
}

/**
 * Create a new category
 */
export async function createCategory(
  data: CreateCategoryBody
): Promise<{ id: number }> {
  const response = await defaultServerInstance.post<{ id: number }>(
    endpoints.categories.root,
    data
  );
  return response.data;
}

/**
 * Update a category
 */
export async function updateCategory(
  id: number,
  data: UpdateCategoryBody
): Promise<Category> {
  const response = await defaultServerInstance.put<Category>(
    endpoints.categories.byId(id.toString()),
    data
  );
  return response.data;
}

/**
 * Delete a category
 */
export async function deleteCategory(id: number): Promise<void> {
  await defaultServerInstance.delete(endpoints.categories.byId(id.toString()));
}
