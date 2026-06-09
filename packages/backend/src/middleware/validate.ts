import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

// Parse req.body against a Zod schema and replace it with the typed result.
// A ZodError bubbles to the error middleware → 400 with the issue list.
export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body);
    next();
  };
}
