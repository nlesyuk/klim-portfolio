// Domain error carries an HTTP status so the central error middleware can map
// it to a response without per-controller try/catch boilerplate.
export class DomainError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "DomainError";
    this.status = status;
  }
}

export class NotFoundError extends DomainError {
  constructor(message = "Not Found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "Unauthorized!") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "Forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}
