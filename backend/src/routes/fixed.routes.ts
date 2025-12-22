import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import * as fixed from "../controllers/fixed.controller";

const router = Router();
router.use(authMiddleware);

router.get("/budgets/:budgetId/fixed-expenses", asyncHandler(fixed.getAll));
router.post("/budgets/:budgetId/fixed-expenses", asyncHandler(fixed.create));
router.delete(
  "/budgets/:budgetId/fixed-expenses/:fixedId",
  asyncHandler(fixed.remove)
);
router.post(
  "/budgets/:budgetId/fixed-expenses/bulk",
  asyncHandler(fixed.createBulk)
);

export default router;
