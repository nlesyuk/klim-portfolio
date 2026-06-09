// Augment Express Request with fields set by our middleware.
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export {};
