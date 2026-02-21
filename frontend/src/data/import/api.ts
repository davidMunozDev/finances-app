import { defaultServerInstance } from "@/config/servers";
import { endpoints } from "@/config/endpoints";
import type {
  ProcessFileResponse,
  BulkImportItem,
  BulkImportResponse,
} from "./types";

export async function processFileContent(
  content: string,
  format: "csv" | "pdf",
  budgetId: string,
): Promise<ProcessFileResponse> {
  const response = await defaultServerInstance.post<ProcessFileResponse>(
    endpoints.assistant.processFile,
    {
      content,
      format,
      budgetId: parseInt(budgetId),
    },
  );
  return response.data;
}

export async function bulkImportTransactions(
  budgetId: string,
  transactions: BulkImportItem[],
): Promise<BulkImportResponse> {
  const response = await defaultServerInstance.post<BulkImportResponse>(
    endpoints.transactions.bulkImport(budgetId),
    { transactions },
  );
  return response.data;
}
