import { verifyToken } from "./authJwt.js";
import { checkUserExisting } from "./tenant.js";

// Visitor routes only need a valid tenant; admin routes also need a valid JWT.
export const visitorCheck = [checkUserExisting];
export const adminCheck = [checkUserExisting, verifyToken];

export { verifyToken, checkUserExisting };
export { validateBody } from "./validate.js";
export { errorHandler } from "./error.js";
