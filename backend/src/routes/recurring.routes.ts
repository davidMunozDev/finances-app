import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import * as recurring from "../controllers/recurring.controller";

const router = Router();
router.use(authMiddleware);

router.get(
  "/budgets/:budgetId/recurring-expenses",
  asyncHandler(recurring.getAll)
);
router.post(
  "/budgets/:budgetId/recurring-expenses",
  asyncHandler(recurring.create)
);
router.put(
  "/budgets/:budgetId/recurring-expenses/:recurringId",
  asyncHandler(recurring.update)
);
router.delete(
  "/budgets/:budgetId/recurring-expenses/:recurringId",
  asyncHandler(recurring.remove)
);

export default router;
