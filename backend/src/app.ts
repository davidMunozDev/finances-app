import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
// @ts-ignore
import YAML from "yamljs";
import path from "path";
import fs from "fs";

import authRoutes from "./routes/auth.routes";
import budgetsRoutes from "./routes/budgets.routes";
import provisionsRoutes from "./routes/provisions.routes";
import recurringRoutes from "./routes/recurring.routes";
import transactionsRoutes from "./routes/transactions.routes";
import expensesRoutes from "./routes/expenses.routes";
import categoriesRoutes from "./routes/categories.routes";
import incomesRoutes from "./routes/incomes.routes";
import assistantRoutes from "./routes/assistant.routes";

import { errorMiddleware } from "./middleware/error.middleware";
import { validateBody } from "./middleware/validate-body.middleware";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// --- CORS ---
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length
      ? (origin, cb) => {
          if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
          cb(new Error("CORS not allowed"));
        }
      : true,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "4mb" }));
app.use(validateBody);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// --- Swagger (safe load) ---
let swaggerDocument: any = null;
try {
  const yamlPath = path.join(__dirname, "..", "api.yaml");
  if (fs.existsSync(yamlPath)) {
    swaggerDocument = YAML.load(yamlPath);
  }
} catch (err) {
  console.warn(
    "⚠️  No se pudo cargar api.yaml para Swagger:",
    (err as Error).message,
  );
}

if (swaggerDocument) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
app.use("/auth", authRoutes);
app.use("/budgets", budgetsRoutes);
app.use("/", provisionsRoutes);
app.use("/", recurringRoutes);
app.use("/", transactionsRoutes);
app.use("/", expensesRoutes);
app.use("/", categoriesRoutes);
app.use("/", incomesRoutes);
app.use("/assistant", assistantRoutes);

app.use(errorMiddleware);

// Para desarrollo local
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Backend escuchando en http://localhost:${PORT}`);
  });
}

// Exportar para Vercel
export default app;
