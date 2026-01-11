import { defaultServerInstance } from "@/config/servers";
import { endpoints } from "@/config/endpoints";
import type { AssistantQueryRequest, AssistantQueryResponse } from "./types";

export async function sendAssistantQuery(
  request: AssistantQueryRequest
): Promise<AssistantQueryResponse> {
  const response = await defaultServerInstance.post<AssistantQueryResponse>(
    endpoints.assistant.query,
    request
  );

  return response.data;
}
