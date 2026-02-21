/**
 * Types for AI Assistant functionality
 */

// ============================================
// REQUEST & RESPONSE TYPES
// ============================================

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
  metadata?: ResponseMetadata;
}

export interface ResponseMetadata {
  total_count?: number;
  showing_first?: number;
  budget_context?: string;
  cached?: boolean;
}

// ============================================
// RECEIPT SCANNING TYPES
// ============================================

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

// ============================================
// FILE IMPORT TYPES
// ============================================

export interface ProcessFileRequest {
  content: string;
  format: "csv" | "pdf";
  budgetId: number;
}

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

export interface BulkImportRequest {
  transactions: BulkImportItem[];
}

export interface BulkImportItem {
  type: "income" | "expense";
  amount: number;
  description?: string;
  date: string; // YYYY-MM-DD
  category_id?: number | null;
}

// ============================================
// DATASET TYPES
// ============================================

export type DatasetName =
  | "budgets"
  | "transactions"
  | "categories"
  | "provisions"
  | "recurring_expenses";

export interface DatasetInfo {
  name: DatasetName;
  description: string;
  available_filters: string[];
  available_sorts: string[];
  available_aggregations: string[];
}

export interface DateRange {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  preset?: "this_month" | "last_month" | "this_year" | "last_year";
}

export interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}

export interface FilterOptions {
  [key: string]: unknown;
}

// ============================================
// TOOL ARGUMENT TYPES
// ============================================

export interface ListDatasetsArgs {
  // No arguments needed
}

export interface QueryDatasetArgs {
  dataset: DatasetName;
  filters?: FilterOptions;
  date_range?: DateRange;
  limit?: number; // default 50, max 200
  sort?: SortOptions;
}

export interface AggregateDatasetArgs {
  dataset: DatasetName;
  metric: "sum" | "avg" | "count" | "min" | "max";
  field?: string; // required for sum/avg/min/max
  group_by?: string[]; // max 2 fields
  date_range?: DateRange;
  filters?: FilterOptions;
}

export interface ComplexAnalysisArgs {
  analysis_type:
    | "week_over_week"
    | "month_over_month"
    | "year_over_year"
    | "trend_analysis"
    | "comparison";
  dataset: DatasetName;
  metric: "sum" | "avg" | "count";
  field?: string;
  date_range?: DateRange;
  filters?: FilterOptions;
}

// ============================================
// TOOL RESULT TYPES
// ============================================

export interface QueryDatasetResult {
  dataset: DatasetName;
  rows: unknown[];
  total_count: number;
  showing_first?: number;
}

export interface AggregateDatasetResult {
  dataset: DatasetName;
  metric: string;
  result: number | AggregateGroupedResult[];
}

export interface AggregateGroupedResult {
  [key: string]: unknown;
  value: number;
}

export interface ComplexAnalysisResult {
  analysis_type: string;
  dataset: DatasetName;
  periods: AnalysisPeriod[];
  summary: {
    trend?: "increasing" | "decreasing" | "stable";
    change_percentage?: number;
    insights?: string[];
  };
}

export interface AnalysisPeriod {
  period: string;
  value: number;
  change_from_previous?: number;
  change_percentage?: number;
}

// ============================================
// CONTEXT TYPES
// ============================================

export interface AssistantContext {
  userId: number;
  budgetId?: number;
  timezone: string;
  currentCycle?: {
    id: number;
    start_date: string;
    end_date: string;
  };
  availableBudgets?: Array<{
    id: number;
    name: string;
    currency: string;
  }>;
}

// ============================================
// CACHE TYPES
// ============================================

export interface CacheEntry {
  key: string;
  data: unknown;
  timestamp: number;
  expiresAt: number;
}

export interface CacheKey {
  type: "query" | "aggregate";
  userId: number;
  dataset: DatasetName;
  params: string; // JSON stringified parameters
}

// ============================================
// DATASET DEFINITION TYPES
// ============================================

export interface DatasetDefinition {
  name: DatasetName;
  description: string;
  allowedFields: string[];
  allowedFilters: {
    [filterName: string]: {
      type: "string" | "number" | "boolean" | "date" | "enum";
      sqlColumn: string;
      operator?: "=" | ">" | "<" | ">=" | "<=" | "LIKE" | "IN";
      enumValues?: string[];
    };
  };
  allowedSorts: {
    [sortName: string]: string; // maps to SQL column
  };
  allowedAggregations: {
    [fieldName: string]: {
      sqlColumn: string;
      supportedMetrics: Array<"sum" | "avg" | "count" | "min" | "max">;
    };
  };
  allowedGroupBy: {
    [groupName: string]: string; // maps to SQL column
  };
  queryBuilder: (
    context: AssistantContext,
    args: QueryDatasetArgs | AggregateDatasetArgs,
  ) => Promise<unknown>;
}
