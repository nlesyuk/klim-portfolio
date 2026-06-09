import { Router } from "express";
import { contactController } from "../controllers/contact.controller.js";
import { adminCheck, validateBody, visitorCheck } from "../middleware/index.js";
import { upload } from "../storage/index.js";
import { ContactInput } from "../schemas/index.js";

const router = Router();

router.get("/contact", visitorCheck, contactController.getContact);
router.put(
  "/contact",
  adminCheck,
  upload.any(),
  validateBody(ContactInput),
  contactController.updateContact,
);
router.post(
  "/contact",
  adminCheck,
  upload.any(),
  validateBody(ContactInput),
  contactController.createContact,
);

export default router;
