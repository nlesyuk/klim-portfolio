import { Router } from "express";
import { shotsController } from "../controllers/shots.controller.js";
import { adminCheck, validateBody, visitorCheck } from "../middleware/index.js";
import { upload } from "../storage/index.js";
import { CreateShotInput, UpdateShotInput } from "../schemas/index.js";

const router = Router();

router.get("/shot", visitorCheck, shotsController.get);
router.post(
  "/shot",
  adminCheck,
  upload.any(),
  validateBody(CreateShotInput),
  shotsController.create,
);
router.put(
  "/shot",
  adminCheck,
  upload.any(),
  validateBody(UpdateShotInput),
  shotsController.update,
);
router.delete("/shot/:id", adminCheck, shotsController.delete);

export default router;
