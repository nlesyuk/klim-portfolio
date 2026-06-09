import { describe, expect, it } from "vitest";
import {
  CreateWorkInput,
  SigninInput,
  UpdateWorkInput,
} from "../src/schemas/index.js";

describe("zod schemas", () => {
  it("rejects signin without a password", () => {
    const r = SigninInput.safeParse({ username: "a" });
    expect(r.success).toBe(false);
  });

  it("coerces order and parses photosInfo array on work create", () => {
    const r = CreateWorkInput.safeParse({
      title: "T",
      videos: "{}",
      order: "3",
      photosInfo: JSON.stringify([{ isPreview: true, order: 0 }]),
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.order).toBe(3);
      expect(r.data.photosInfo).toHaveLength(1);
    }
  });

  it("parses photosInfo object shape on work update", () => {
    const r = UpdateWorkInput.safeParse({
      id: "5",
      title: "T",
      videos: "{}",
      order: "1",
      photosInfo: JSON.stringify({ deleted: [1, 2], new: [], updated: [] }),
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.id).toBe(5);
      expect(r.data.photosInfo.deleted).toEqual([1, 2]);
    }
  });

  it("rejects invalid JSON in photosInfo", () => {
    const r = CreateWorkInput.safeParse({
      title: "T",
      videos: "{}",
      order: "1",
      photosInfo: "not json",
    });
    expect(r.success).toBe(false);
  });
});
