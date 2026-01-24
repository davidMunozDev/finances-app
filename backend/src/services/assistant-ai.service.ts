import OpenAI from "openai";
import {
  AssistantContext,
  AssistantQueryResponse,
  QueryDatasetArgs,
  AggregateDatasetArgs,
  ComplexAnalysisArgs,
  ComplexAnalysisResult,
  AnalysisPeriod,
  ScanReceiptResponse,
} from "../types/assistant.types";
import {
  listDatasets,
  queryDataset,
  aggregateDataset,
} from "./assistant-datasets.service";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// ============================================
// TOOL DEFINITIONS
// ============================================

const TOOL_DEFINITIONS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "listDatasets",
      description:
        "Obtiene la lista de datasets (conjuntos de datos) disponibles para consultar. Usa esto primero para saber qué datos están disponibles.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "queryDataset",
      description:
        "Consulta filas de un dataset con filtros, ordenamiento y límites. Útil para obtener listas de transacciones, presupuestos, categorías, etc.",
      parameters: {
        type: "object",
        properties: {
          dataset: {
            type: "string",
            enum: [
              "budgets",
              "transactions",
              "categories",
              "provisions",
              "recurring_expenses",
            ],
            description: "El dataset a consultar",
          },
          filters: {
            type: "object",
            description:
              "Filtros a aplicar (dependen del dataset). Ejemplos: {type: 'expense'}, {category_id: 5}",
            properties: {
              type: { type: "string" },
              category_id: { type: "number" },
              provision_id: { type: "number" },
              source: { type: "string" },
              min_amount: { type: "number" },
              max_amount: { type: "number" },
              is_active: { type: "boolean" },
              currency: { type: "string" },
              user_owned: { type: "boolean" },
              frequency: { type: "string" },
            },
          },
          date_range: {
            type: "object",
            description:
              "Rango de fechas. Si se omite, usa el ciclo actual. Puede especificar preset o from/to explícito.",
            properties: {
              from: {
                type: "string",
                description: "Fecha inicio en formato YYYY-MM-DD",
              },
              to: {
                type: "string",
                description: "Fecha fin en formato YYYY-MM-DD",
              },
              preset: {
                type: "string",
                enum: ["this_month", "last_month", "this_year", "last_year"],
                description: "Preset de rango de fechas",
              },
            },
          },
          limit: {
            type: "number",
            description:
              "Número máximo de filas a devolver (default 50, max 200)",
          },
          sort: {
            type: "object",
            description: "Ordenamiento",
            properties: {
              field: {
                type: "string",
                description:
                  "Campo por el que ordenar (ej: date, amount, name)",
              },
              direction: {
                type: "string",
                enum: ["asc", "desc"],
                description: "Dirección del ordenamiento",
              },
            },
            required: ["field", "direction"],
          },
        },
        required: ["dataset"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "aggregateDataset",
      description:
        "Calcula agregaciones sobre un dataset: suma, promedio, conteo, mínimo, máximo. Puede agrupar por 1-2 campos.",
      parameters: {
        type: "object",
        properties: {
          dataset: {
            type: "string",
            enum: [
              "budgets",
              "transactions",
              "categories",
              "provisions",
              "recurring_expenses",
            ],
            description: "El dataset a agregar",
          },
          metric: {
            type: "string",
            enum: ["sum", "avg", "count", "min", "max"],
            description: "La métrica a calcular",
          },
          field: {
            type: "string",
            description:
              "Campo sobre el que calcular (requerido para sum/avg/min/max). Ejemplos: amount, id",
          },
          group_by: {
            type: "array",
            description:
              "Campos por los que agrupar (máximo 2). Ejemplos: ['category_name'], ['type', 'source']",
            items: {
              type: "string",
            },
            maxItems: 2,
          },
          date_range: {
            type: "object",
            description:
              "Rango de fechas. Si se omite, usa el ciclo actual. Puede especificar preset o from/to explícito.",
            properties: {
              from: { type: "string" },
              to: { type: "string" },
              preset: {
                type: "string",
                enum: ["this_month", "last_month", "this_year", "last_year"],
              },
            },
          },
          filters: {
            type: "object",
            description: "Filtros a aplicar antes de agregar",
          },
        },
        required: ["dataset", "metric"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "complexAnalysis",
      description:
        "Realiza análisis complejos: comparaciones semana-a-semana, mes-a-mes, año-a-año, tendencias.",
      parameters: {
        type: "object",
        properties: {
          analysis_type: {
            type: "string",
            enum: [
              "week_over_week",
              "month_over_month",
              "year_over_year",
              "trend_analysis",
            ],
            description: "Tipo de análisis temporal a realizar",
          },
          dataset: {
            type: "string",
            enum: ["transactions"],
            description: "Dataset a analizar (típicamente transactions)",
          },
          metric: {
            type: "string",
            enum: ["sum", "avg", "count"],
            description: "Métrica a calcular por período",
          },
          field: {
            type: "string",
            description: "Campo a medir (ej: amount para gastos totales)",
          },
          date_range: {
            type: "object",
            description:
              "Rango de fechas para el análisis (requerido para análisis temporal)",
            properties: {
              from: { type: "string" },
              to: { type: "string" },
              preset: {
                type: "string",
                enum: ["this_month", "last_month", "this_year", "last_year"],
              },
            },
          },
          filters: {
            type: "object",
            description: "Filtros adicionales (ej: {type: 'expense'})",
          },
        },
        required: ["analysis_type", "dataset", "metric"],
      },
    },
  },
];

// ============================================
// SYSTEM PROMPT
// ============================================

const SYSTEM_PROMPT = `Eres un asistente financiero inteligente para una aplicación de presupuestos personales.

REGLAS OBLIGATORIAS:
1. NUNCA inventes datos. Siempre usa las herramientas (tools) para obtener información real.
2. NO puedes acceder a datos de autenticación (usuarios, contraseñas, tokens, emails). Solo datos financieros.
3. Responde en ESPAÑOL con formato claro y profesional.
4. Usa formato de moneda en EUROS con 2 decimales (ej: 1.234,56 €).
5. Formatea fechas de forma legible (ej: "15 de enero de 2026" o "enero 2026").
6. Si la pregunta es ambigua o falta información, solicita aclaración con needs_clarification.
7. Si no hay datos, explica qué información faltaría registrar.
8. Sé conciso pero informativo. Proporciona contexto relevante.

DATASETS DISPONIBLES:
- budgets: Presupuestos del usuario
- transactions: Gastos e ingresos (filtrar por budgetId)
- categories: Categorías de gastos
- provisions: Asignaciones de presupuesto a categorías
- recurring_expenses: Gastos recurrentes automáticos

FLUJO DE TRABAJO:
1. Si no conoces los datasets, usa listDatasets() primero.
2. Para preguntas sobre totales/promedios, usa aggregateDataset().
3. Para listas detalladas, usa queryDataset().
4. Para análisis temporales complejos, usa complexAnalysis().
5. Combina múltiples herramientas si es necesario (máximo 5 llamadas).

EJEMPLOS DE ANÁLISIS:
- "¿Cuánto gasté este mes?" → aggregateDataset(transactions, sum, amount, {type: 'expense'}, this_month)
- "¿Cuáles son mis gastos más altos?" → queryDataset(transactions, {type: 'expense'}, sort: amount desc, limit: 10)
- "¿En qué categoría gasto más?" → aggregateDataset(transactions, sum, amount, group_by: ['category_name'], {type: 'expense'})
- "Comparación mes a mes" → complexAnalysis(month_over_month, transactions, sum, amount)

Ahora procesa la consulta del usuario usando las herramientas disponibles.`;

// ============================================
// TOOL EXECUTION
// ============================================

async function executeTool(
  toolName: string,
  args: any,
  context: AssistantContext
): Promise<any> {
  switch (toolName) {
    case "listDatasets":
      return { datasets: listDatasets() };

    case "queryDataset":
      return await queryDataset(context, args as QueryDatasetArgs);

    case "aggregateDataset":
      return await aggregateDataset(context, args as AggregateDatasetArgs);

    case "complexAnalysis":
      return await performComplexAnalysis(context, args as ComplexAnalysisArgs);

    default:
      throw new Error(`Herramienta desconocida: ${toolName}`);
  }
}

// ============================================
// COMPLEX ANALYSIS IMPLEMENTATION
// ============================================

async function performComplexAnalysis(
  context: AssistantContext,
  args: ComplexAnalysisArgs
): Promise<ComplexAnalysisResult> {
  const { analysis_type, dataset, metric, field, date_range, filters } = args;

  if (dataset !== "transactions") {
    throw new Error(
      "complexAnalysis solo soporta el dataset 'transactions' por ahora"
    );
  }

  // Parse date range
  const now = new Date();
  let periods: AnalysisPeriod[] = [];

  switch (analysis_type) {
    case "month_over_month": {
      // Get last 6 months
      periods = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth();
        const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
        const to = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(
          year,
          month + 1,
          0
        ).getDate()}`;

        const result = await aggregateDataset(context, {
          dataset,
          metric,
          field,
          filters,
          date_range: { from, to },
        });

        const value = typeof result.result === "number" ? result.result : 0;
        periods.push({
          period: `${year}-${String(month + 1).padStart(2, "0")}`,
          value,
        });
      }
      break;
    }

    case "year_over_year": {
      // Compare this year vs last year by month
      const currentYear = now.getFullYear();
      for (let month = 0; month < 12; month++) {
        const thisYearFrom = `${currentYear}-${String(month + 1).padStart(
          2,
          "0"
        )}-01`;
        const thisYearTo = `${currentYear}-${String(month + 1).padStart(
          2,
          "0"
        )}-${new Date(currentYear, month + 1, 0).getDate()}`;

        const lastYearFrom = `${currentYear - 1}-${String(month + 1).padStart(
          2,
          "0"
        )}-01`;
        const lastYearTo = `${currentYear - 1}-${String(month + 1).padStart(
          2,
          "0"
        )}-${new Date(currentYear - 1, month + 1, 0).getDate()}`;

        const [thisYear, lastYear] = await Promise.all([
          aggregateDataset(context, {
            dataset,
            metric,
            field,
            filters,
            date_range: { from: thisYearFrom, to: thisYearTo },
          }),
          aggregateDataset(context, {
            dataset,
            metric,
            field,
            filters,
            date_range: { from: lastYearFrom, to: lastYearTo },
          }),
        ]);

        const thisYearValue =
          typeof thisYear.result === "number" ? thisYear.result : 0;
        const lastYearValue =
          typeof lastYear.result === "number" ? lastYear.result : 0;
        const change = thisYearValue - lastYearValue;
        const changePercent =
          lastYearValue !== 0 ? (change / lastYearValue) * 100 : 0;

        periods.push({
          period: `${currentYear}-${String(month + 1).padStart(2, "0")} vs ${
            currentYear - 1
          }-${String(month + 1).padStart(2, "0")}`,
          value: thisYearValue,
          change_from_previous: change,
          change_percentage: changePercent,
        });
      }
      break;
    }

    case "trend_analysis": {
      // Last 12 months trend
      periods = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth();
        const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
        const to = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(
          year,
          month + 1,
          0
        ).getDate()}`;

        const result = await aggregateDataset(context, {
          dataset,
          metric,
          field,
          filters,
          date_range: { from, to },
        });

        const value = typeof result.result === "number" ? result.result : 0;
        periods.push({
          period: `${year}-${String(month + 1).padStart(2, "0")}`,
          value,
        });
      }
      break;
    }

    default:
      throw new Error(`Tipo de análisis no soportado: ${analysis_type}`);
  }

  // Calculate changes and trend
  for (let i = 1; i < periods.length; i++) {
    const current = periods[i].value;
    const previous = periods[i - 1].value;
    periods[i].change_from_previous = current - previous;
    if (previous !== 0) {
      periods[i].change_percentage = ((current - previous) / previous) * 100;
    }
  }

  // Determine overall trend
  const values = periods.map((p) => p.value);
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  let trend: "increasing" | "decreasing" | "stable" = "stable";
  const trendChange = ((secondAvg - firstAvg) / firstAvg) * 100;

  if (trendChange > 10) trend = "increasing";
  else if (trendChange < -10) trend = "decreasing";

  return {
    analysis_type,
    dataset,
    periods,
    summary: {
      trend,
      change_percentage: trendChange,
      insights: [
        `Promedio primera mitad: ${firstAvg.toFixed(2)}`,
        `Promedio segunda mitad: ${secondAvg.toFixed(2)}`,
        `Tendencia general: ${
          trend === "increasing"
            ? "creciente"
            : trend === "decreasing"
            ? "decreciente"
            : "estable"
        }`,
      ],
    },
  };
}

// ============================================
// MAIN QUERY PROCESSOR
// ============================================

export async function processQuery(
  question: string,
  context: AssistantContext
): Promise<AssistantQueryResponse> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY no está configurada");
  }

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: question,
    },
  ];

  let toolCallCount = 0;
  const MAX_TOOL_CALLS = 5;
  let lastToolUsed: string | undefined;
  let lastToolData: any = undefined;

  while (toolCallCount < MAX_TOOL_CALLS) {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages,
      tools: TOOL_DEFINITIONS,
      tool_choice: "auto",
      temperature: 0.1, // Low temperature for factual responses
    });

    const message = response.choices[0].message;

    // Add assistant message to conversation
    messages.push(message);

    // Check if tool calls are needed
    if (!message.tool_calls || message.tool_calls.length === 0) {
      // No more tool calls, return final answer
      const answer = message.content || "No pude procesar la consulta.";

      // Check if asking for clarification
      const needsClarification =
        answer.toLowerCase().includes("¿") ||
        answer.toLowerCase().includes("aclarar") ||
        answer.toLowerCase().includes("especifica");

      return {
        answer,
        data: lastToolData,
        tool_used: lastToolUsed,
        needs_clarification: needsClarification,
        clarifying_question: needsClarification ? answer : undefined,
        metadata: lastToolData?.showing_first
          ? {
              total_count: lastToolData.total_count,
              showing_first: lastToolData.showing_first,
            }
          : undefined,
      };
    }

    // Execute tool calls
    const toolResults: OpenAI.Chat.ChatCompletionToolMessageParam[] = [];

    for (const toolCall of message.tool_calls) {
      toolCallCount++;

      if (toolCallCount > MAX_TOOL_CALLS) {
        throw new Error(
          `Se excedió el límite de ${MAX_TOOL_CALLS} llamadas a herramientas. Pregunta demasiado compleja.`
        );
      }

      // Type guard for function tool calls
      if (toolCall.type !== "function") continue;

      const toolName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);

      lastToolUsed = toolName;

      try {
        const result = await executeTool(toolName, args, context);
        lastToolData = result;

        toolResults.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      } catch (error: any) {
        toolResults.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            error: error.message || "Error ejecutando herramienta",
          }),
        });
      }
    }

    // Add tool results to conversation
    messages.push(...toolResults);
  }

  throw new Error(
    `Se excedió el límite de ${MAX_TOOL_CALLS} llamadas a herramientas`
  );
}

// ============================================
// FORMATTING UTILITIES
// ============================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

// ============================================
// RECEIPT PROCESSING
// ============================================

export async function processReceiptText(
  text: string,
  categories: Array<{ id: number; name: string }>
): Promise<ScanReceiptResponse> {
  const categoryNames = categories.map((c) => c.name).join(", ");

  const prompt = `Eres un asistente experto en procesar tickets y recibos en español.

Analiza el siguiente texto extraído de un recibo mediante OCR y extrae la siguiente información:

1. **merchant**: Nombre del comercio/establecimiento (ej: "Mercadona", "Carrefour", "El Corte Inglés")
2. **amount**: Importe total en euros. Acepta tanto formato "12,50" como "12.50". Busca palabras clave como "TOTAL", "Importe", "A PAGAR", "EFECTIVO"
3. **category**: Categoría más apropiada del gasto según estas opciones disponibles: [${categoryNames}]. Si no estás seguro, usa "Otros"
4. **detail**: Un resumen detallado que incluya:
   - Comercio
   - Desglose de productos/servicios con cantidades y precios (si están disponibles)

Formato de respuesta JSON:
{
  "merchant": "nombre del comercio o null",
  "amount": número o null,
  "category": "nombre de categoría o null",
  "detail": "texto descriptivo o null"
}

IMPORTANTE:
- Solo devuelve campos si tienes confianza razonable en la extracción
- Si no encuentras un campo, devuelve null
- Para amount, convierte comas a puntos decimales
- Para category, elige solo de las categorías proporcionadas
- Para detail, crea un texto legible con el comercio y los productos principales

TEXTO DEL RECIBO:
${text}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente que procesa recibos españoles y devuelve JSON válido.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(responseText);

    // Validate and normalize the response
    const result: ScanReceiptResponse = {
      merchant: parsed.merchant || null,
      amount:
        parsed.amount && !isNaN(parseFloat(parsed.amount))
          ? parseFloat(parsed.amount)
          : null,
      category:
        parsed.category &&
        categories.some(
          (c) => c.name.toLowerCase() === parsed.category.toLowerCase()
        )
          ? parsed.category
          : null,
      detail: parsed.detail || null,
    };

    return result;
  } catch (error) {
    console.error("Error processing receipt text:", error);
    // Return empty response on error
    return {
      merchant: null,
      amount: null,
      category: null,
      detail: null,
    };
  }
}
