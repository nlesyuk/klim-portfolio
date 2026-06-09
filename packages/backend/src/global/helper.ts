import type { Request } from "express";
import { v4 as uuidv4 } from "uuid";
import type { Slide } from "@klim/shared";
import { db } from "../db/index.js";
import { env } from "../env.js";
import { DomainError } from "../errors.js";
import { buildImageUrl } from "../storage/index.js";
import { sitesByUserId } from "./constants.js";

// Resolve the tenant user id from the request `domain` header.
export function getUserIdByDomain(domain: string | undefined): number {
  if (!domain) throw new DomainError("Domain doesn't exist", 400);
  const userId = sitesByUserId[domain];
  if (userId) return userId;
  throw new DomainError(`Unknown domain: ${domain}`, 400);
}

// Resolve the tenant user id for a request from its `domain` header.
export function userIdFromRequest(req: Request): number {
  const d = req.headers.domain;
  return getUserIdByDomain(Array.isArray(d) ? d[0] : d);
}

// Files attached by multer, regardless of .any()/.array() shape.
export function filesOf(req: Request): Express.Multer.File[] {
  const f = req.files;
  if (Array.isArray(f)) return f;
  if (f && typeof f === "object") return Object.values(f).flat();
  return [];
}

// Issue a new refresh token and persist it on the user row.
export async function createRefreshToken(userId: number): Promise<string> {
  if (typeof userId !== "number") {
    throw new Error("userId should be a number");
  }
  const expiredAt = new Date();
  expiredAt.setSeconds(expiredAt.getSeconds() + env.JWT_REFRESH_EXPIRATION);
  const token = uuidv4();

  const updated = await db
    .updateTable("users")
    .set({ refresh_token: token, expiry_date: String(expiredAt.getTime()) })
    .where("id", "=", userId)
    .returning("refresh_token")
    .executeTakeFirst();

  return updated?.refresh_token ?? token;
}

export function isRefreshTokenExpired(expiryDate: string | null): boolean {
  const ms = Number(expiryDate);
  if (Number.isNaN(ms)) {
    throw new Error("expiryDate should be a number");
  }
  return ms < Date.now();
}

// Row shape coming back from the slides table for client mapping.
export interface SlideRow {
  id: number;
  type: string | null;
  title: string | null;
  image: string | null;
  slide_order: number | null;
  videos: string | null;
  work_id: number | null;
  photo_id: number | null;
}

export function prepareSlideDataForClient(
  row: SlideRow | undefined,
  userId?: number,
): Slide | null {
  if (!row) return null;
  return {
    id: row.id,
    type: (row.type as Slide["type"]) ?? "image",
    title: row.title ?? "",
    image: row.image ? buildImageUrl(row.image, userId) : null,
    order: row.slide_order ?? 0,
    videos: row.videos || null,
    workId: row.work_id,
    photoId: row.photo_id,
  };
}
