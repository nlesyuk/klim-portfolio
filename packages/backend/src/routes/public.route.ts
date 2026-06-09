import path from "node:path";
import { fileURLToPath } from "node:url";
import { Router } from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.resolve(__dirname, "../../public/uploads");

const router = Router();

// Serves disk-stored uploads in the local/disk fallback. When S3 is enabled
// the FE reads object-storage URLs directly and this route is unused.
router.get("/uploads/:user/:category/:file", (req, res) => {
  const { user, category, file } = req.params;
  res.sendFile(path.join(uploadsRoot, user, category, file));
});

export default router;
