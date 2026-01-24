import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import * as assistantController from "../controllers/assistant.controller";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// POST /assistant/query - Process AI assistant query
router.post("/query", asyncHandler(assistantController.query));

// POST /assistant/invalidate-cache - Invalidate cache for user
router.post(
  "/invalidate-cache",
  asyncHandler(assistantController.invalidateCacheEndpoint)
);

// POST /assistant/scan-receipt - Process receipt text with AI
router.post("/scan-receipt", asyncHandler(assistantController.scanReceipt));

export default router;
