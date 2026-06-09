import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";
import { DomainError } from "../errors.js";
import { removeUploadedFiles } from "../storage/index.js";

// Single error sink — replaces the per-controller try/catch → res.status(500).
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
   
  _next: NextFunction,
): void {
  // Best-effort rollback of any files uploaded before the failure.
  void removeUploadedFiles(req.files as Express.Multer.File[] | undefined);

  req.log?.error({ err }, "request failed");

  if (err instanceof ZodError) {
    res.status(400).json({ message: "Validation failed", issues: err.issues });
    return;
  }
  if (err instanceof MulterError) {
    res.status(400).json({ message: err.message });
    return;
  }
  if (err instanceof DomainError) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  const message = err instanceof Error ? err.message : "Internal Server Error";
  res.status(500).json({ message });
}
