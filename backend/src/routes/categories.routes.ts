import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import * as categories from "../controllers/categories.controller";

const router = Router();
router.use(authMiddleware);

router.get("/categories", asyncHandler(categories.getAll));
router.post("/categories", asyncHandler(categories.create));
router.delete("/categories/:id", asyncHandler(categories.remove));
router.put("/categories/:id", asyncHandler(categories.update));

export default router;
