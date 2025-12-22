import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import {
  getAll,
  create,
  getOne,
  update,
  remove,
} from "../controllers/budgets.controller";

const router = Router();
router.use(authMiddleware);

router.get("/", asyncHandler(getAll));
router.post("/", asyncHandler(create));
router.get("/:id", asyncHandler(getOne));
router.put("/:id", asyncHandler(update));
router.delete("/:id", asyncHandler(remove));

export default router;
