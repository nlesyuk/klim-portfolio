import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/index.js";
import {
  LogoutInput,
  RefreshTokenInput,
  SigninInput,
  SignupInput,
} from "../schemas/index.js";

const router = Router();

router.post("/auth/signup", validateBody(SignupInput), authController.signup);
router.post("/auth/signin", validateBody(SigninInput), authController.signin);
router.post("/auth/logout", validateBody(LogoutInput), authController.logout);
router.post(
  "/auth/refreshtoken",
  validateBody(RefreshTokenInput),
  authController.refreshToken,
);

export default router;
