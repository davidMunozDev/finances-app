import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import * as t from "../controllers/transactions.controller";

const router = Router();
router.use(authMiddleware);

router.post("/budgets/:budgetId/transactions", asyncHandler(t.addManual));
router.post(
  "/budgets/:budgetId/transactions/import",
  asyncHandler(t.bulkImport),
);
router.get("/budgets/:budgetId/summary", asyncHandler(t.currentSummary));

export default router;
