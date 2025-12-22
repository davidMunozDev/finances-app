import { Router } from "express";
import {
  register,
  login,
  logout,
  me,
  deleteUser,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/logout", authMiddleware, asyncHandler(logout));
router.get("/me", authMiddleware, asyncHandler(me));
router.delete("/delete", authMiddleware, asyncHandler(deleteUser));

export default router;
