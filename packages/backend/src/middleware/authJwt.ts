import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../env.js";
import { ForbiddenError, UnauthorizedError } from "../errors.js";

const { TokenExpiredError } = jwt;

// Verifies the x-access-token JWT. Runs AFTER tenant check and BEFORE multer,
// so unauthenticated requests never reach the upload parser (R4).
export function verifyToken(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers["x-access-token"];
  const token = Array.isArray(header) ? header[0] : header;

  if (!token) {
    throw new ForbiddenError("No token provided!");
  }

  try {
    // Pin the algorithm — jwt@9 rejects unset `algorithms` (CVE-2022-23529).
    const decoded = jwt.verify(token, env.SECRET, {
      algorithms: ["HS256"],
    }) as { id: number };
    req.userId = decoded.id;
    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new UnauthorizedError("Unauthorized! Access Token was expired!");
    }
    throw new UnauthorizedError();
  }
}
