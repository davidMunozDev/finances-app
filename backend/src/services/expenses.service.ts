import type { ExpenseCreateBody } from "../validators/expense.validator";
import type { ExpenseCreateResult } from "../types/expense.types";

import { syncBudgetCycle } from "./budget-cycles.service";
import { createManualTransaction } from "./transactions.service";
import { createRecurring } from "./recurring.service";

export async function createExpense(params: {
  userId: number;
  budgetId: number;
  body: ExpenseCreateBody;
}): Promise<ExpenseCreateResult> {
  const { userId, budgetId, body } = params;

  if (body.type === "one_time") {
    const cycle = await syncBudgetCycle({ userId, budgetId });
    if (!cycle) throw new Error("No cycle resolved");

    const dateISO = body.date ?? new Date().toISOString().slice(0, 10);

    const id = await createManualTransaction({
      userId,
      budgetId,
      cycleId: cycle.id,
      categoryId: body.category_id,
      provisionId: body.provision_id,
      description: body.description,
      amount: body.amount,
      dateISO,
    });

    return { kind: "transaction", id };
  }

  // recurring
  const schedule = body.schedule;

  const id = await createRecurring(budgetId, {
    category_id: body.category_id,
    name: body.name.trim(),
    amount: body.amount,
    frequency: schedule.frequency,
    ...(schedule.frequency === "weekly" ? { dow: schedule.dow } : {}),
    ...(schedule.frequency === "monthly" ? { dom: schedule.dom } : {}),
    ...(schedule.frequency === "yearly"
      ? { month: schedule.month, day: schedule.day }
      : {}),
  } as any);

  // opcional: sincronizar para que, si cae dentro del ciclo actual, se genere ya
  await syncBudgetCycle({ userId, budgetId });

  return { kind: "recurring_rule", id };
}
