import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import * as provisions from "../controllers/provisions.controller";

const router = Router();
router.use(authMiddleware);

router.get("/budgets/:budgetId/provisions", asyncHandler(provisions.getAll));
router.post("/budgets/:budgetId/provisions", asyncHandler(provisions.create));
router.delete(
  "/budgets/:budgetId/provisions/:provisionId",
  asyncHandler(provisions.remove)
);
router.post(
  "/budgets/:budgetId/provisions/bulk",
  asyncHandler(provisions.createBulk)
);

export default router;
