import { Router } from "express";
import { photoCollectionsController } from "../controllers/photoCollections.controller.js";
import { adminCheck, validateBody, visitorCheck } from "../middleware/index.js";
import { upload } from "../storage/index.js";
import {
  CreatePhotoCollectionInput,
  UpdatePhotoCollectionInput,
} from "../schemas/index.js";

const router = Router();

router.get("/photos", visitorCheck, photoCollectionsController.get);
router.get("/photos/:id", visitorCheck, photoCollectionsController.getById);
router.put(
  "/photos",
  adminCheck,
  upload.any(),
  validateBody(UpdatePhotoCollectionInput),
  photoCollectionsController.update,
);
router.post(
  "/photos",
  adminCheck,
  upload.any(),
  validateBody(CreatePhotoCollectionInput),
  photoCollectionsController.create,
);
router.delete("/photos/:id", adminCheck, photoCollectionsController.delete);

export default router;
