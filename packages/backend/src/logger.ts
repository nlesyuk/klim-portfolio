import { pino } from "pino";
import { isProd, isTest } from "./env.js";

// Structured JSON logs in prod; pretty in dev; silent in tests.
export const logger = pino({
  level: isTest ? "silent" : process.env.LOG_LEVEL ?? "info",
  transport: isProd
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:standard" },
      },
});
