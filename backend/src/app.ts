import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
// @ts-ignore
import YAML from "yamljs";
import path from "path";

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
const swaggerDocument = YAML.load(path.join(process.cwd(), "api.yaml"));

app.use(cors());
app.use(express.json());
app.use(validateBody);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en http://localhost:${PORT}`);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/auth", authRoutes);
app.use("/budgets", budgetsRoutes);
app.use("/", provisionsRoutes);
app.use("/", recurringRoutes);
app.use("/", transactionsRoutes);
app.use("/", expensesRoutes);
app.use("/", categoriesRoutes);
app.use("/", incomesRoutes);
app.use("/assistant", assistantRoutes);

app.use(cookieParser());
app.use(errorMiddleware);
