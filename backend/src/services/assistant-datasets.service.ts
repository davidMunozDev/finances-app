import {
  AssistantContext,
  DatasetDefinition,
  DatasetInfo,
  DatasetName,
  QueryDatasetArgs,
  AggregateDatasetArgs,
  QueryDatasetResult,
  AggregateDatasetResult,
  DateRange,
  CacheEntry,
  CacheKey,
} from "../types/assistant.types";
import { listBudgets, getBudgetById } from "./budgets.service";
import {
  listCycleTransactions,
  getCycleTotals,
  getCycleIncomes,
} from "./transactions.service";
import { listCategories } from "./categories.service";
import { listProvisions, getProvisionsTotal } from "./provisions.service";
import { listRecurring } from "./recurring.service";
import { pool } from "../db";
import { DBRow } from "../types/db.types";

// ============================================
// CACHE IMPLEMENTATION (5-minute TTL)
// ============================================

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCacheKey(key: CacheKey): string {
  return `${key.type}:${key.userId}:${key.dataset}:${key.params}`;
}

export function getCachedData(key: CacheKey): unknown | null {
  const cacheKeyStr = getCacheKey(key);
  const entry = cache.get(cacheKeyStr);

  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(cacheKeyStr);
    return null;
  }

  return entry.data;
}

export function setCachedData(key: CacheKey, data: unknown): void {
  const cacheKeyStr = getCacheKey(key);
  cache.set(cacheKeyStr, {
    key: cacheKeyStr,
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export function invalidateCache(userId: number, dataset?: DatasetName): void {
  if (dataset) {
    // Invalidate specific dataset for user
    for (const [key] of cache) {
      if (key.includes(`:${userId}:${dataset}:`)) {
        cache.delete(key);
      }
    }
  } else {
    // Invalidate all cache for user
    for (const [key] of cache) {
      if (key.includes(`:${userId}:`)) {
        cache.delete(key);
      }
    }
  }
}

// ============================================
// DATE RANGE UTILITIES
// ============================================

function parseDateRange(
  dateRange: DateRange | undefined,
  timezone: string,
  currentCycle?: { start_date: string; end_date: string }
): { from: string; to: string } {
  if (!dateRange) {
    // Default to current cycle
    if (currentCycle) {
      return { from: currentCycle.start_date, to: currentCycle.end_date };
    }
    // Fallback to current month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return {
      from: `${year}-${month}-01`,
      to: `${year}-${month}-${new Date(year, now.getMonth() + 1, 0).getDate()}`,
    };
  }

  if (dateRange.from && dateRange.to) {
    return { from: dateRange.from, to: dateRange.to };
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  switch (dateRange.preset) {
    case "this_month":
      return {
        from: `${year}-${String(month + 1).padStart(2, "0")}-01`,
        to: `${year}-${String(month + 1).padStart(2, "0")}-${new Date(
          year,
          month + 1,
          0
        ).getDate()}`,
      };
    case "last_month": {
      const lastMonth = month === 0 ? 11 : month - 1;
      const lastMonthYear = month === 0 ? year - 1 : year;
      return {
        from: `${lastMonthYear}-${String(lastMonth + 1).padStart(2, "0")}-01`,
        to: `${lastMonthYear}-${String(lastMonth + 1).padStart(
          2,
          "0"
        )}-${new Date(lastMonthYear, lastMonth + 1, 0).getDate()}`,
      };
    }
    case "this_year":
      return {
        from: `${year}-01-01`,
        to: `${year}-12-31`,
      };
    case "last_year":
      return {
        from: `${year - 1}-01-01`,
        to: `${year - 1}-12-31`,
      };
    default:
      return currentCycle
        ? { from: currentCycle.start_date, to: currentCycle.end_date }
        : {
            from: `${year}-${String(month + 1).padStart(2, "0")}-01`,
            to: `${year}-12-31`,
          };
  }
}

// ============================================
// DATASET DEFINITIONS
// ============================================

const BUDGETS_DATASET: DatasetDefinition = {
  name: "budgets",
  description: "Presupuestos del usuario con configuración de ciclos y moneda",
  allowedFields: [
    "id",
    "name",
    "currency",
    "reset_frequency",
    "reset_day",
    "is_active",
  ],
  allowedFilters: {
    is_active: {
      type: "boolean",
      sqlColumn: "is_active",
      operator: "=",
    },
    currency: {
      type: "string",
      sqlColumn: "currency",
      operator: "=",
    },
  },
  allowedSorts: {
    name: "name",
    created_at: "created_at",
  },
  allowedAggregations: {
    id: {
      sqlColumn: "id",
      supportedMetrics: ["count"],
    },
  },
  allowedGroupBy: {
    currency: "currency",
    reset_frequency: "reset_frequency",
  },
  queryBuilder: async (context: AssistantContext, args: QueryDatasetArgs) => {
    const budgets = await listBudgets(context.userId);

    let filtered = budgets;

    // Apply filters
    if (args.filters) {
      if (args.filters.is_active !== undefined) {
        filtered = filtered.filter(
          (b) => b.is_active === args.filters!.is_active
        );
      }
      if (args.filters.currency) {
        filtered = filtered.filter(
          (b) => b.currency === args.filters!.currency
        );
      }
    }

    // Apply sort
    if (args.sort) {
      const sortField = args.sort.field as keyof (typeof filtered)[0];
      filtered.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return args.sort!.direction === "asc" ? comparison : -comparison;
      });
    }

    // Apply limit
    const limit = Math.min(args.limit || 50, 200);
    const total = filtered.length;
    const limited = filtered.slice(0, limit);

    return {
      rows: limited,
      total_count: total,
      showing_first: total > limit ? limit : undefined,
    };
  },
};

const TRANSACTIONS_DATASET: DatasetDefinition = {
  name: "transactions",
  description:
    "Todas las transacciones (gastos e ingresos) del usuario, filtradas por presupuesto y ciclo",
  allowedFields: [
    "id",
    "type",
    "description",
    "amount",
    "date",
    "category_id",
    "category_name",
    "provision_id",
    "provision_name",
    "source",
  ],
  allowedFilters: {
    type: {
      type: "enum",
      sqlColumn: "type",
      operator: "=",
      enumValues: ["income", "expense"],
    },
    category_id: {
      type: "number",
      sqlColumn: "category_id",
      operator: "=",
    },
    provision_id: {
      type: "number",
      sqlColumn: "provision_id",
      operator: "=",
    },
    source: {
      type: "enum",
      sqlColumn: "source",
      operator: "=",
      enumValues: ["manual", "recurring"],
    },
    min_amount: {
      type: "number",
      sqlColumn: "amount",
      operator: ">=",
    },
    max_amount: {
      type: "number",
      sqlColumn: "amount",
      operator: "<=",
    },
  },
  allowedSorts: {
    date: "date",
    amount: "amount",
    description: "description",
  },
  allowedAggregations: {
    amount: {
      sqlColumn: "amount",
      supportedMetrics: ["sum", "avg", "min", "max", "count"],
    },
    id: {
      sqlColumn: "id",
      supportedMetrics: ["count"],
    },
  },
  allowedGroupBy: {
    type: "type",
    category_id: "category_id",
    category_name: "category_name",
    provision_id: "provision_id",
    source: "source",
    date: "date",
  },
  queryBuilder: async (context: AssistantContext, args: QueryDatasetArgs) => {
    if (!context.budgetId) {
      throw new Error("budgetId es requerido para consultar transacciones");
    }

    const dateRange = parseDateRange(
      args.date_range,
      context.timezone,
      context.currentCycle
    );

    // Check if querying current cycle or historical
    const useHistorical =
      !context.currentCycle ||
      dateRange.from !== context.currentCycle.start_date ||
      dateRange.to !== context.currentCycle.end_date;

    let transactions: any[];

    if (useHistorical) {
      // For historical queries, use direct SQL query
      const [rows] = await pool.query<DBRow<any>[]>(
        `SELECT t.*, 
                c.name as category_name,
                p.name as provision_name
         FROM transactions t
         LEFT JOIN categories c ON t.category_id = c.id
         LEFT JOIN budget_provisions p ON t.provision_id = p.id
         WHERE t.user_id = ? AND t.budget_id = ? AND t.date BETWEEN ? AND ?
         ORDER BY t.date DESC`,
        [context.userId, context.budgetId, dateRange.from, dateRange.to]
      );
      transactions = rows;
    } else if (context.currentCycle) {
      transactions = await listCycleTransactions({
        userId: context.userId,
        budgetId: context.budgetId,
        cycleId: context.currentCycle.id,
      });
    } else {
      throw new Error("No se pudo determinar el ciclo actual");
    }

    let filtered = transactions;

    // Apply filters
    if (args.filters) {
      if (args.filters.type) {
        filtered = filtered.filter((t: any) => t.type === args.filters!.type);
      }
      if (args.filters.category_id) {
        filtered = filtered.filter(
          (t: any) => t.category_id === args.filters!.category_id
        );
      }
      if (args.filters.provision_id) {
        filtered = filtered.filter(
          (t: any) => t.provision_id === args.filters!.provision_id
        );
      }
      if (args.filters.source) {
        filtered = filtered.filter(
          (t: any) => t.source === args.filters!.source
        );
      }
      if (args.filters.min_amount) {
        filtered = filtered.filter(
          (t: any) => t.amount >= (args.filters!.min_amount as number)
        );
      }
      if (args.filters.max_amount) {
        filtered = filtered.filter(
          (t: any) => t.amount <= (args.filters!.max_amount as number)
        );
      }
    }

    // Apply sort
    if (args.sort) {
      const sortField = args.sort.field as keyof (typeof filtered)[0];
      filtered.sort((a: any, b: any) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return args.sort!.direction === "asc" ? comparison : -comparison;
      });
    }

    // Apply limit
    const limit = Math.min(args.limit || 50, 200);
    const total = filtered.length;
    const limited = filtered.slice(0, limit);

    return {
      rows: limited,
      total_count: total,
      showing_first: total > limit ? limit : undefined,
    };
  },
};

const CATEGORIES_DATASET: DatasetDefinition = {
  name: "categories",
  description: "Categorías de gastos (globales y del usuario)",
  allowedFields: ["id", "name", "icon", "user_id"],
  allowedFilters: {
    user_owned: {
      type: "boolean",
      sqlColumn: "user_id",
      operator: "=",
    },
  },
  allowedSorts: {
    name: "name",
  },
  allowedAggregations: {
    id: {
      sqlColumn: "id",
      supportedMetrics: ["count"],
    },
  },
  allowedGroupBy: {
    user_owned: "CASE WHEN user_id IS NULL THEN 'global' ELSE 'user' END",
  },
  queryBuilder: async (context: AssistantContext, args: QueryDatasetArgs) => {
    const categories = await listCategories(context.userId);

    let filtered = categories;

    // Apply filters
    if (args.filters) {
      if (args.filters.user_owned === true) {
        filtered = filtered.filter((c) => c.user_id !== null);
      } else if (args.filters.user_owned === false) {
        filtered = filtered.filter((c) => c.user_id === null);
      }
    }

    // Apply sort
    if (args.sort) {
      const sortField = args.sort.field as keyof (typeof filtered)[0];
      filtered.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return args.sort!.direction === "asc" ? comparison : -comparison;
      });
    }

    // Apply limit
    const limit = Math.min(args.limit || 50, 200);
    const total = filtered.length;
    const limited = filtered.slice(0, limit);

    return {
      rows: limited,
      total_count: total,
      showing_first: total > limit ? limit : undefined,
    };
  },
};

const PROVISIONS_DATASET: DatasetDefinition = {
  name: "provisions",
  description: "Provisiones asignadas a categorías dentro de un presupuesto",
  allowedFields: [
    "id",
    "budget_id",
    "category_id",
    "category_name",
    "name",
    "amount",
  ],
  allowedFilters: {
    category_id: {
      type: "number",
      sqlColumn: "category_id",
      operator: "=",
    },
    min_amount: {
      type: "number",
      sqlColumn: "amount",
      operator: ">=",
    },
    max_amount: {
      type: "number",
      sqlColumn: "amount",
      operator: "<=",
    },
  },
  allowedSorts: {
    name: "name",
    amount: "amount",
    category_name: "category_name",
  },
  allowedAggregations: {
    amount: {
      sqlColumn: "amount",
      supportedMetrics: ["sum", "avg", "min", "max", "count"],
    },
    id: {
      sqlColumn: "id",
      supportedMetrics: ["count"],
    },
  },
  allowedGroupBy: {
    category_id: "category_id",
    category_name: "category_name",
  },
  queryBuilder: async (context: AssistantContext, args: QueryDatasetArgs) => {
    if (!context.budgetId) {
      throw new Error("budgetId es requerido para consultar provisiones");
    }

    const provisions = await listProvisions(context.budgetId);

    let filtered = provisions;

    // Apply filters
    if (args.filters) {
      if (args.filters.category_id) {
        filtered = filtered.filter(
          (p) => p.category_id === args.filters!.category_id
        );
      }
      if (args.filters.min_amount) {
        filtered = filtered.filter(
          (p) => Number(p.amount) >= (args.filters!.min_amount as number)
        );
      }
      if (args.filters.max_amount) {
        filtered = filtered.filter(
          (p) => Number(p.amount) <= (args.filters!.max_amount as number)
        );
      }
    }

    // Apply sort
    if (args.sort) {
      const sortField = args.sort.field as keyof (typeof filtered)[0];
      filtered.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return args.sort!.direction === "asc" ? comparison : -comparison;
      });
    }

    // Apply limit
    const limit = Math.min(args.limit || 50, 200);
    const total = filtered.length;
    const limited = filtered.slice(0, limit);

    return {
      rows: limited,
      total_count: total,
      showing_first: total > limit ? limit : undefined,
    };
  },
};

const RECURRING_EXPENSES_DATASET: DatasetDefinition = {
  name: "recurring_expenses",
  description: "Gastos recurrentes configurados para generación automática",
  allowedFields: [
    "id",
    "budget_id",
    "category_id",
    "category_name",
    "description",
    "amount",
    "frequency",
    "reset_day",
  ],
  allowedFilters: {
    category_id: {
      type: "number",
      sqlColumn: "category_id",
      operator: "=",
    },
    frequency: {
      type: "enum",
      sqlColumn: "frequency",
      operator: "=",
      enumValues: ["weekly", "monthly", "yearly"],
    },
    min_amount: {
      type: "number",
      sqlColumn: "amount",
      operator: ">=",
    },
    max_amount: {
      type: "number",
      sqlColumn: "amount",
      operator: "<=",
    },
  },
  allowedSorts: {
    description: "description",
    amount: "amount",
    category_name: "category_name",
  },
  allowedAggregations: {
    amount: {
      sqlColumn: "amount",
      supportedMetrics: ["sum", "avg", "min", "max", "count"],
    },
    id: {
      sqlColumn: "id",
      supportedMetrics: ["count"],
    },
  },
  allowedGroupBy: {
    category_id: "category_id",
    category_name: "category_name",
    frequency: "frequency",
  },
  queryBuilder: async (context: AssistantContext, args: QueryDatasetArgs) => {
    if (!context.budgetId) {
      throw new Error(
        "budgetId es requerido para consultar gastos recurrentes"
      );
    }

    const recurring = await listRecurring(context.budgetId);

    let filtered = recurring;

    // Apply filters
    if (args.filters) {
      if (args.filters.category_id) {
        filtered = filtered.filter(
          (r) => r.category_id === args.filters!.category_id
        );
      }
      if (args.filters.frequency) {
        filtered = filtered.filter(
          (r) => r.frequency === args.filters!.frequency
        );
      }
      if (args.filters.min_amount) {
        filtered = filtered.filter(
          (r) => Number(r.amount) >= (args.filters!.min_amount as number)
        );
      }
      if (args.filters.max_amount) {
        filtered = filtered.filter(
          (r) => Number(r.amount) <= (args.filters!.max_amount as number)
        );
      }
    }

    // Apply sort
    if (args.sort) {
      const sortField = args.sort.field as keyof (typeof filtered)[0];
      filtered.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return args.sort!.direction === "asc" ? comparison : -comparison;
      });
    }

    // Apply limit
    const limit = Math.min(args.limit || 50, 200);
    const total = filtered.length;
    const limited = filtered.slice(0, limit);

    return {
      rows: limited,
      total_count: total,
      showing_first: total > limit ? limit : undefined,
    };
  },
};

// ============================================
// DATASET REGISTRY
// ============================================

const DATASETS: Record<DatasetName, DatasetDefinition> = {
  budgets: BUDGETS_DATASET,
  transactions: TRANSACTIONS_DATASET,
  categories: CATEGORIES_DATASET,
  provisions: PROVISIONS_DATASET,
  recurring_expenses: RECURRING_EXPENSES_DATASET,
};

// ============================================
// PUBLIC API
// ============================================

export function listDatasets(): DatasetInfo[] {
  return Object.values(DATASETS).map((dataset) => ({
    name: dataset.name,
    description: dataset.description,
    available_filters: Object.keys(dataset.allowedFilters),
    available_sorts: Object.keys(dataset.allowedSorts),
    available_aggregations: Object.keys(dataset.allowedAggregations),
  }));
}

export async function queryDataset(
  context: AssistantContext,
  args: QueryDatasetArgs
): Promise<QueryDatasetResult> {
  const dataset = DATASETS[args.dataset];
  if (!dataset) {
    throw new Error(`Dataset desconocido: ${args.dataset}`);
  }

  // Validate filters
  if (args.filters) {
    for (const filterKey of Object.keys(args.filters)) {
      if (!dataset.allowedFilters[filterKey]) {
        throw new Error(
          `Filtro no permitido para ${args.dataset}: ${filterKey}`
        );
      }
    }
  }

  // Validate sort
  if (args.sort && !dataset.allowedSorts[args.sort.field]) {
    throw new Error(
      `Ordenamiento no permitido para ${args.dataset}: ${args.sort.field}`
    );
  }

  // Check cache
  const cacheKey: CacheKey = {
    type: "query",
    userId: context.userId,
    dataset: args.dataset,
    params: JSON.stringify(args),
  };

  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached as QueryDatasetResult;
  }

  // Execute query
  const result = (await dataset.queryBuilder(
    context,
    args
  )) as QueryDatasetResult;
  result.dataset = args.dataset;

  // Cache result
  setCachedData(cacheKey, result);

  return result;
}

export async function aggregateDataset(
  context: AssistantContext,
  args: AggregateDatasetArgs
): Promise<AggregateDatasetResult> {
  const dataset = DATASETS[args.dataset];
  if (!dataset) {
    throw new Error(`Dataset desconocido: ${args.dataset}`);
  }

  // Validate field for sum/avg/min/max
  if (args.metric !== "count") {
    if (!args.field) {
      throw new Error(`El campo es requerido para la métrica ${args.metric}`);
    }
    const aggConfig = dataset.allowedAggregations[args.field];
    if (!aggConfig) {
      throw new Error(
        `Campo no permitido para agregación en ${args.dataset}: ${args.field}`
      );
    }
    if (!aggConfig.supportedMetrics.includes(args.metric)) {
      throw new Error(
        `Métrica ${args.metric} no soportada para ${args.field} en ${args.dataset}`
      );
    }
  }

  // Validate group_by
  if (args.group_by) {
    if (args.group_by.length > 2) {
      throw new Error("Máximo 2 campos para agrupar");
    }
    for (const groupField of args.group_by) {
      if (!dataset.allowedGroupBy[groupField]) {
        throw new Error(
          `Campo de agrupación no permitido para ${args.dataset}: ${groupField}`
        );
      }
    }
  }

  // Check cache
  const cacheKey: CacheKey = {
    type: "aggregate",
    userId: context.userId,
    dataset: args.dataset,
    params: JSON.stringify(args),
  };

  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached as AggregateDatasetResult;
  }

  // First, query the dataset to get base data
  const queryArgs: QueryDatasetArgs = {
    dataset: args.dataset,
    filters: args.filters,
    date_range: args.date_range,
    limit: 200, // Get all for aggregation
  };

  const queryResult = await queryDataset(context, queryArgs);
  const rows = queryResult.rows as any[];

  let result: number | any[];

  if (!args.group_by || args.group_by.length === 0) {
    // Simple aggregation without grouping
    result = computeAggregation(rows, args.metric, args.field);
  } else {
    // Aggregation with grouping
    const grouped = new Map<string, any[]>();

    for (const row of rows) {
      const groupKey = args.group_by
        .map((field) => row[field] ?? "null")
        .join("||");
      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, []);
      }
      grouped.get(groupKey)!.push(row);
    }

    result = [];
    for (const [groupKey, groupRows] of grouped) {
      const groupValues = groupKey.split("||");
      const aggregatedValue = computeAggregation(
        groupRows,
        args.metric,
        args.field
      );

      const resultItem: any = {};
      args.group_by.forEach((field, idx) => {
        resultItem[field] =
          groupValues[idx] === "null" ? null : groupValues[idx];
      });
      resultItem.value = aggregatedValue;

      result.push(resultItem);
    }

    // Sort by value descending
    result.sort((a: any, b: any) => b.value - a.value);
  }

  const aggregateResult: AggregateDatasetResult = {
    dataset: args.dataset,
    metric: `${args.metric}(${args.field || "*"})`,
    result,
  };

  // Cache result
  setCachedData(cacheKey, aggregateResult);

  return aggregateResult;
}

function computeAggregation(
  rows: any[],
  metric: string,
  field?: string
): number {
  if (rows.length === 0) return 0;

  switch (metric) {
    case "count":
      return rows.length;
    case "sum":
      return rows.reduce((sum, row) => sum + (Number(row[field!]) || 0), 0);
    case "avg": {
      const sum = rows.reduce(
        (sum, row) => sum + (Number(row[field!]) || 0),
        0
      );
      return sum / rows.length;
    }
    case "min":
      return Math.min(...rows.map((row) => Number(row[field!]) || 0));
    case "max":
      return Math.max(...rows.map((row) => Number(row[field!]) || 0));
    default:
      throw new Error(`Métrica desconocida: ${metric}`);
  }
}
