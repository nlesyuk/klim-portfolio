import { Router } from "express";
import { workController } from "../controllers/work.controller.js";
import { adminCheck, validateBody, visitorCheck } from "../middleware/index.js";
import { upload } from "../storage/index.js";
import { CreateWorkInput, UpdateWorkInput } from "../schemas/index.js";

const router = Router();

router.get("/work", visitorCheck, workController.getWorks);
router.get("/work/:id", visitorCheck, workController.getWork);
router.put(
  "/work",
  adminCheck,
  upload.any(),
  validateBody(UpdateWorkInput),
  workController.update,
);
router.post(
  "/work",
  adminCheck,
  upload.any(),
  validateBody(CreateWorkInput),
  workController.create,
);
router.delete("/work/:id", adminCheck, workController.delete);

export default router;
