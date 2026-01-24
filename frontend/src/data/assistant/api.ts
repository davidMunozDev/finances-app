import { defaultServerInstance } from "@/config/servers";
import { endpoints } from "@/config/endpoints";
import type {
  AssistantQueryRequest,
  AssistantQueryResponse,
  ScanReceiptRequest,
  ScanReceiptResponse,
} from "./types";

export async function sendAssistantQuery(
  request: AssistantQueryRequest
): Promise<AssistantQueryResponse> {
  const response = await defaultServerInstance.post<AssistantQueryResponse>(
    endpoints.assistant.query,
    request
  );

  return response.data;
}

export async function scanReceipt(
  text: string,
  budgetId: string
): Promise<ScanReceiptResponse> {
  const request: ScanReceiptRequest = {
    text,
    budgetId: parseInt(budgetId),
  };

  const response = await defaultServerInstance.post<ScanReceiptResponse>(
    "/assistant/scan-receipt",
    request
  );

  return response.data;
}
