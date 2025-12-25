import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import * as incomes from "../controllers/incomes.controller";

const router = Router();
router.use(authMiddleware);

router.post("/budgets/:budgetId/incomes", asyncHandler(incomes.create));
router.get("/budgets/:budgetId/incomes", asyncHandler(incomes.getAll));

export default router;
