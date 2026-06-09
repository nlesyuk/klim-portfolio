import { createApp } from "./app.js";
import { db } from "./db/index.js";
import { env } from "./env.js";
import { logger } from "./logger.js";

const app = createApp();
const server = app.listen(env.PORT, () => {
  logger.info(`Server started on http://localhost:${env.PORT}/api/v1`);
});

// Graceful shutdown: stop accepting connections, drain, close the pool.
async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, "shutting down");
  server.close(async () => {
    try {
      await db.destroy();
    } finally {
      process.exit(0);
    }
  });
  // Hard limit if drain hangs.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
