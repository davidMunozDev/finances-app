import { pool } from "../db";
import type { DBRow, DBResult } from "../types/db.types";
import type { BudgetRow } from "../types/budget.types";
import type { BudgetCycleRow } from "../types/cycle.types";

function toISO(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// dow: 1..7 (Mon..Sun)
function jsDowToIso(d: Date) {
  const js = d.getDay(); // 0=Sun..6=Sat
  return js === 0 ? 7 : js;
}

// devuelve el próximo inicio de ciclo <= hoy o el inicio más cercano previo
function computeCurrentCycle(
  budget: BudgetRow,
  today: Date
): { start: Date; end: Date } {
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);

  if (budget.reset_type === "weekly") {
    const targetDow = budget.reset_dow!;
    const todayIsoDow = jsDowToIso(t);
    const diff = (todayIsoDow - targetDow + 7) % 7; // días desde el último reset
    const start = addDays(t, -diff);
    const end = addDays(start, 6);
    return { start, end };
  }

  if (budget.reset_type === "monthly") {
    const dom = budget.reset_dom!;
    // start: último día dom (o el dom de este mes si ya pasó)
    const y = t.getFullYear();
    const m = t.getMonth(); // 0..11

    const thisMonthReset = new Date(y, m, dom);
    thisMonthReset.setHours(0, 0, 0, 0);

    let start: Date;
    if (t >= thisMonthReset) start = thisMonthReset;
    else start = new Date(y, m - 1, dom);

    const next = new Date(start.getFullYear(), start.getMonth() + 1, dom);
    next.setHours(0, 0, 0, 0);
    const end = addDays(next, -1);
    return { start, end };
  }

  // yearly
  const month = budget.reset_month!; // 1..12
  const day = budget.reset_day!;
  const y = t.getFullYear();

  const thisYearReset = new Date(y, month - 1, day);
  thisYearReset.setHours(0, 0, 0, 0);

  const start =
    t >= thisYearReset ? thisYearReset : new Date(y - 1, month - 1, day);
  start.setHours(0, 0, 0, 0);

  const next = new Date(start.getFullYear() + 1, month - 1, day);
  next.setHours(0, 0, 0, 0);

  const end = addDays(next, -1);
  return { start, end };
}

async function getBudget(budgetId: number, userId: number) {
  const [rows] = await pool.query<DBRow<BudgetRow>[]>(
    `SELECT id, user_id, name, currency, reset_type, reset_dow, reset_dom, reset_month, reset_day, is_active
     FROM budgets
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [budgetId, userId]
  );
  return rows[0] ?? null;
}

async function getActiveCycle(budgetId: number, todayISO: string) {
  const [rows] = await pool.query<DBRow<BudgetCycleRow>[]>(
    `SELECT id, budget_id, start_date, end_date
     FROM budget_cycles
     WHERE budget_id = ?
       AND start_date <= ?
       AND end_date >= ?
     ORDER BY start_date DESC
     LIMIT 1`,
    [budgetId, todayISO, todayISO]
  );
  return rows[0] ?? null;
}

async function createCycle(budgetId: number, startISO: string, endISO: string) {
  const [result] = await pool.query<DBResult>(
    `INSERT INTO budget_cycles (budget_id, start_date, end_date)
     VALUES (?, ?, ?)`,
    [budgetId, startISO, endISO]
  );
  const id = result.insertId;

  const [rows] = await pool.query<DBRow<BudgetCycleRow>[]>(
    `SELECT id, budget_id, start_date, end_date FROM budget_cycles WHERE id = ?`,
    [id]
  );
  return rows[0];
}

async function insertFixedTransactions(params: {
  userId: number;
  budgetId: number;
  cycleId: number;
  dateISO: string;
}) {
  // Insert idempotente: unique_key evita duplicados
  await pool.query(
    `INSERT INTO transactions (user_id, budget_id, cycle_id, category_id, type, description, amount, date, source, unique_key)
     SELECT ?, f.budget_id, ?, f.category_id, 'expense', f.name, f.amount, ?, 'fixed',
            CONCAT('fixed:', f.id, ':cycle:', ?, ':date:', ?)
     FROM budget_fixed_expenses f
     WHERE f.budget_id = ?
     ON DUPLICATE KEY UPDATE transactions.id = transactions.id`,
    [
      params.userId,
      params.cycleId,
      params.dateISO,
      params.cycleId,
      params.dateISO,
      params.budgetId,
    ]
  );
}

async function insertRecurringTransactionsForCycle(params: {
  userId: number;
  budgetId: number;
  cycle: BudgetCycleRow;
}) {
  // Traemos recurrentes
  const [recurrings] = await pool.query<
    DBRow<{
      id: number;
      budget_id: number;
      category_id: number;
      name: string;
      amount: string;
      frequency: "weekly" | "monthly" | "yearly";
      dow: number | null;
      dom: number | null;
      month: number | null;
      day: number | null;
    }>[]
  >(
    `SELECT id, budget_id, category_id, name, amount, frequency, dow, dom, month, day
     FROM budget_recurring_expenses
     WHERE budget_id = ?`,
    [params.budgetId]
  );

  const start = new Date(params.cycle.start_date + "T00:00:00");
  const end = new Date(params.cycle.end_date + "T00:00:00");

  for (const r of recurrings) {
    const dates: string[] = [];

    if (r.frequency === "weekly") {
      const target = r.dow!;
      // recorremos días del ciclo
      let cur = new Date(start);
      while (cur <= end) {
        if (jsDowToIso(cur) === target) dates.push(toISO(cur));
        cur = addDays(cur, 1);
      }
    }

    if (r.frequency === "monthly") {
      const dom = r.dom!;
      // solo 1 ocurrencia dentro del ciclo: el dom del mes del start (si cae dentro del rango)
      // Si tu ciclo puede cruzar meses (mensual día 14 → al 13 del mes siguiente) puede haber 2 meses.
      // Por eso recorremos meses entre start y end.
      let y = start.getFullYear();
      let m = start.getMonth();
      const endY = end.getFullYear();
      const endM = end.getMonth();

      while (y < endY || (y === endY && m <= endM)) {
        const d = new Date(y, m, dom);
        d.setHours(0, 0, 0, 0);
        if (d >= start && d <= end) dates.push(toISO(d));
        m++;
        if (m > 11) {
          m = 0;
          y++;
        }
      }
    }

    if (r.frequency === "yearly") {
      const month = r.month!;
      const day = r.day!;
      let y = start.getFullYear();
      const endY = end.getFullYear();
      while (y <= endY) {
        const d = new Date(y, month - 1, day);
        d.setHours(0, 0, 0, 0);
        if (d >= start && d <= end) dates.push(toISO(d));
        y++;
      }
    }

    // Insert idempotente por fecha
    for (const dateISO of dates) {
      await pool.query(
        `INSERT INTO transactions (user_id, budget_id, cycle_id, category_id, type, description, amount, date, source, unique_key)
         VALUES (?, ?, ?, ?, 'expense', ?, ?, ?, 'recurring',
                 CONCAT('recurring:', ?, ':cycle:', ?, ':date:', ?))
         ON DUPLICATE KEY UPDATE id = id`,
        [
          params.userId,
          params.budgetId,
          params.cycle.id,
          r.category_id,
          r.name,
          r.amount,
          dateISO,
          r.id,
          params.cycle.id,
          dateISO,
        ]
      );
    }
  }
}

/**
 * Garantiza que el ciclo actual existe y, si hace falta, crea el nuevo ciclo y genera
 * transacciones fijas y recurrentes. Devuelve el ciclo actual.
 */
export async function syncBudgetCycle(params: {
  userId: number;
  budgetId: number;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = toISO(today);

  const budget = await getBudget(params.budgetId, params.userId);
  if (!budget) return null;

  // 1) Si ya existe un ciclo que contiene hoy, lo devolvemos (pero aún así podemos asegurar recurrentes/fijos idempotentes)
  let cycle = await getActiveCycle(budget.id, todayISO);

  // 2) Si no existe ciclo activo para hoy, creamos el ciclo correcto para hoy
  if (!cycle) {
    const { start, end } = computeCurrentCycle(budget, today);
    cycle = await createCycle(budget.id, toISO(start), toISO(end));
  }

  // 3) Generar transacciones fijas (en el start_date del ciclo)
  await insertFixedTransactions({
    userId: params.userId,
    budgetId: budget.id,
    cycleId: cycle.id,
    dateISO: cycle.start_date,
  });

  // 4) Generar transacciones recurrentes dentro del ciclo
  await insertRecurringTransactionsForCycle({
    userId: params.userId,
    budgetId: budget.id,
    cycle,
  });

  return cycle;
}
