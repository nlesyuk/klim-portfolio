import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from "multer";
import multerS3 from "multer-s3";
import type { Request } from "express";
import { env, isS3Enabled } from "../env.js";
import { logger } from "../logger.js";
import { categories } from "../global/constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// backend/public — disk root when S3 is not configured.
const diskRoot = path.resolve(__dirname, "../../");

const sanitize = /[^a-zA-Z0-9.]/gi;

// Derive the storage category (work/shot/photo/…) from the request URL.
function categoryFromUrl(rawUrl: string): string | null {
  const found = rawUrl
    .split("/")
    .find((seg) => (categories as readonly string[]).includes(seg));
  return found ?? null;
}

function domainOf(req: Request): string {
  const domain = req.headers.domain;
  return Array.isArray(domain) ? domain[0] : domain ?? "";
}

function makeFilename(req: Request, originalname: string): string {
  const domain = domainOf(req);
  let name = originalname.replace(sanitize, "");
  if (!name.length) name = `image_${Date.now()}`;
  return `${Date.now()}_${domain}_${name}`;
}

const s3 = isS3Enabled
  ? new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      forcePathStyle: Boolean(env.S3_ENDPOINT), // MinIO/R2 path-style
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID as string,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY as string,
      },
    })
  : null;

function diskStorage() {
  return multer.diskStorage({
    destination(req, _file, cb) {
      const domain = domainOf(req);
      if (!domain) return cb(new Error("Domain not provided"), "");
      const category = categoryFromUrl(req.originalUrl);
      if (!category) return cb(new Error("Category not found"), "");
      const dest = path.resolve(
        diskRoot,
        `public/uploads/${domain}/${category}`,
      );
      fs.mkdir(dest, { recursive: true }, (err) => cb(err, dest));
    },
    filename(req, file, cb) {
      cb(null, makeFilename(req, file.originalname));
    },
  });
}

function s3Storage() {
  return multerS3({
    s3: s3 as S3Client,
    bucket: env.S3_BUCKET as string,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key(req, file, cb) {
      const domain = domainOf(req as Request);
      const category = categoryFromUrl((req as Request).originalUrl);
      if (!domain) return cb(new Error("Domain not provided"));
      if (!category) return cb(new Error("Category not found"));
      cb(null, `${domain}/${category}/${makeFilename(req as Request, file.originalname)}`);
    },
  });
}

export const upload = multer({
  storage: isS3Enabled ? s3Storage() : diskStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

// The canonical storage key persisted in the DB `image` column.
//  - S3:   "<domain>/<category>/<file>"        (multer-s3 sets file.key)
//  - disk: "public/uploads/<domain>/<cat>/<file>"
export function storageKeyOf(
  file: Express.Multer.File | undefined | null,
): string | null {
  if (!file) return null;
  const s3file = file as Express.Multer.File & { key?: string };
  if (s3file.key) return s3file.key;
  if (file.destination && file.filename) {
    const parts = file.destination.split(path.sep);
    const idx = parts.indexOf("public");
    if (idx !== -1) {
      return `${parts.slice(idx).join("/")}/${file.filename}`;
    }
  }
  return null;
}

// Build the public URL the FE consumes from a stored key.
export function buildImageUrl(
  image: string | null | undefined,
  _userId?: number,
): string | null {
  if (!image) return null;
  const base = isS3Enabled
    ? env.S3_PUBLIC_BASE_URL ?? ""
    : env.PUBLIC_BASE_URL;
  const key = image.replace(/^\/+/, "");
  return base ? `${base.replace(/\/+$/, "")}/${key}` : `/${key}`;
}

// A short-lived signed URL for a private object (S3 only).
export async function signedImageUrl(image: string): Promise<string | null> {
  if (!isS3Enabled || !s3) return buildImageUrl(image);
  const cmd = new GetObjectCommand({
    Bucket: env.S3_BUCKET as string,
    Key: image.replace(/^\/+/, ""),
  });
  return getSignedUrl(s3, cmd, { expiresIn: 3600 });
}

// Reverse of buildImageUrl: turn a (possibly absolute) src back into the key.
export function stripImageUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  let s = String(src).split("?")[0]; // drop signed-url query
  for (const base of [env.S3_PUBLIC_BASE_URL, env.PUBLIC_BASE_URL]) {
    if (base && s.startsWith(base)) s = s.slice(base.length);
  }
  s = s.replace(/^https?:\/\//, "").replace(/^\/\//, "");
  // If a bare host remains as the first segment, drop it.
  const publicIdx = s.indexOf("public/uploads");
  if (publicIdx !== -1) return s.slice(publicIdx);
  return s.replace(/^\/+/, "");
}

async function removeStoredKey(key: string | null): Promise<void> {
  if (!key) return;
  try {
    if (isS3Enabled && s3) {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: env.S3_BUCKET as string,
          Key: key.replace(/^\/+/, ""),
        }),
      );
    } else {
      await fs.promises.unlink(path.resolve(diskRoot, key));
    }
  } catch (err) {
    logger.warn({ err, key }, "failed to remove stored file");
  }
}

// Delete files that were uploaded before a request failed (rollback).
export async function removeUploadedFiles(
  files: Express.Multer.File[] | undefined | null,
): Promise<void> {
  if (!files?.length) return;
  await Promise.all(files.map((f) => removeStoredKey(storageKeyOf(f))));
}

export async function removeStoredFile(key: string | null): Promise<void> {
  await removeStoredKey(key);
}
