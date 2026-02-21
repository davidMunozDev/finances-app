export interface ExtractedTransaction {
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  category: string | null;
}

export interface ProcessFileResponse {
  transactions: ExtractedTransaction[];
}

export interface BulkImportItem {
  type: "income" | "expense";
  amount: number;
  description?: string;
  date: string; // YYYY-MM-DD
  category_id?: number | null;
}

export interface BulkImportResponse {
  created: number;
}
