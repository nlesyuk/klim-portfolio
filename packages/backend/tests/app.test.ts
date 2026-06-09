import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

const app = createApp();
const DOMAIN = "klimstepan.com";

describe("HTTP contract (no-DB paths)", () => {
  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/nope");
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Not Found");
  });

  it("rejects signin with a missing password (400 before DB)", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signin")
      .send({ username: "x" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
  });

  it("rejects a request with an unknown tenant domain (400)", async () => {
    const res = await request(app)
      .get("/api/v1/work")
      .set("domain", "evil.example");
    expect(res.status).toBe(400);
  });

  it("rejects a write without a JWT (403)", async () => {
    const res = await request(app)
      .delete("/api/v1/work/1")
      .set("domain", DOMAIN);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe("No token provided!");
  });
});

// NOTE: full integration tests (auth flow + one CRUD per resource) need a live
// Postgres. Wire them with testcontainers or a docker-compose service and a
// per-test DATABASE_URL, then exercise createApp() the same way as above.
