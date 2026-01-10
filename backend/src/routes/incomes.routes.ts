import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import * as incomes from "../controllers/incomes.controller";

const router = Router();
router.use(authMiddleware);

router.post("/budgets/:budgetId/incomes", asyncHandler(incomes.create));
router.get("/budgets/:budgetId/incomes", asyncHandler(incomes.getAll));
router.put(
  "/budgets/:budgetId/incomes/:incomeId",
  asyncHandler(incomes.update)
);
router.delete(
  "/budgets/:budgetId/incomes/:incomeId",
  asyncHandler(incomes.remove)
);

export default router;
