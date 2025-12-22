import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import * as expenses from "../controllers/expenses.controller";

const router = Router();
router.use(authMiddleware);

router.post("/budgets/:budgetId/expenses", asyncHandler(expenses.create));

export default router;
