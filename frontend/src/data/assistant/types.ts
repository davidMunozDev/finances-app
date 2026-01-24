export interface AssistantQueryRequest {
  question: string;
  budgetId?: number;
  timezone?: string;
}

export interface AssistantQueryResponse {
  answer: string;
  data?: unknown;
  tool_used?: string;
  needs_clarification?: boolean;
  clarifying_question?: string;
  metadata?: {
    total_count?: number;
    showing_first?: number;
    budget_context?: string;
    cached?: boolean;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  data?: unknown;
  timestamp: Date;
}

export interface ScanReceiptRequest {
  text: string;
  budgetId: number;
}

export interface ScanReceiptResponse {
  merchant?: string | null;
  amount?: number | null;
  category?: string | null;
  detail?: string | null;
}
