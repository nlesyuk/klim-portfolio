import type { NextFunction, Request, Response } from "express";
import { getUserIdByDomain } from "../global/helper.js";

// Validates the `domain` header maps to a known tenant. Throws DomainError
// (→ 400) otherwise. Kept separate from auth so visitor routes can use it alone.
export function checkUserExisting(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const domain = req.headers.domain;
  getUserIdByDomain(Array.isArray(domain) ? domain[0] : domain);
  next();
}
