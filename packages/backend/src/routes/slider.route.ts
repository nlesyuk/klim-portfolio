import { Router } from "express";
import { sliderController } from "../controllers/slider.controller.js";
import { adminCheck, validateBody, visitorCheck } from "../middleware/index.js";
import { upload } from "../storage/index.js";
import { CreateSlideInput, UpdateSlideInput } from "../schemas/index.js";

const router = Router();

router.get("/slider", visitorCheck, sliderController.get);
router.get("/slider/:id", visitorCheck, sliderController.getById);
router.put(
  "/slider",
  adminCheck,
  upload.any(),
  validateBody(UpdateSlideInput),
  sliderController.update,
);
router.post(
  "/slider",
  adminCheck,
  upload.any(),
  validateBody(CreateSlideInput),
  sliderController.create,
);
router.delete("/slider/:id", adminCheck, sliderController.delete);

export default router;
