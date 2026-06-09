import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { DomainError } from "../errors.js";
import { filesOf, userIdFromRequest } from "../global/helper.js";
import {
  buildImageUrl,
  removeStoredFile,
  removeUploadedFiles,
  storageKeyOf,
} from "../storage/index.js";
import { CreateShotInput, UpdateShotInput } from "../schemas/index.js";

export const shotsController = {
  async create(req: Request, res: Response): Promise<void> {
    const userId = userIdFromRequest(req);
    const { shots } = req.body as z.infer<typeof CreateShotInput>;
    const files = filesOf(req);
    if (!files.length) throw new DomainError("files don't exist", 400);

    const first = shots[0];
    const categories = first.categories ?? ["all"];

    let shotId: number | undefined;
    try {
      const shot = await db
        .insertInto("shot")
        .values({
          categories,
          work_id: first.workId ?? null,
          user_id: userId,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      shotId = shot.id;

      const image = storageKeyOf(files[0]);
      await db
        .insertInto("photos")
        .values({
          shot_id: shotId,
          image,
          format: first.format ?? null,
          user_id: userId,
        })
        .execute();

      res.json([
        {
          id: shot.id,
          format: first.format ?? null,
          workId: shot.work_id,
          categories: shot.categories,
          src: buildImageUrl(image, userId),
        },
      ]);
    } catch (err) {
      await removeUploadedFiles(files);
      if (shotId) await db.deleteFrom("shot").where("id", "=", shotId).execute();
      throw err;
    }
  },

  async get(req: Request, res: Response): Promise<void> {
    const userId = userIdFromRequest(req);

    const shots = await db.selectFrom("shot").selectAll().execute();
    const photos = await db
      .selectFrom("photos")
      .selectAll()
      .where("shot_id", "is not", null)
      .where("user_id", "=", userId)
      .execute();

    res.json(
      photos.map((photo) => {
        const shot = shots.find((s) => s.id === photo.shot_id);
        return {
          id: photo.shot_id,
          format: photo.format,
          src: buildImageUrl(photo.image, userId),
          workId: shot?.work_id,
          categories: shot?.categories,
        };
      }),
    );
  },

  async update(req: Request, res: Response): Promise<void> {
    const userId = userIdFromRequest(req);
    const { id, src, workId, categories, format } = req.body as z.infer<
      typeof UpdateShotInput
    >;
    const files = filesOf(req);
    const newImageKey = files.length ? storageKeyOf(files[0]) : null;

    const updatedShot = await db
      .updateTable("shot")
      .set({ categories, work_id: workId ?? null })
      .where("id", "=", id)
      .where("user_id", "=", userId)
      .returningAll()
      .executeTakeFirst();

    const response = {
      id,
      src: src ?? "",
      workId: updatedShot?.work_id ?? null,
      categories: updatedShot?.categories ?? [],
      format: format ?? "",
    };

    // Find the previous image so it can be removed after a successful swap.
    let previousKey: string | null = null;
    if (!src && newImageKey) {
      const existing = await db
        .selectFrom("photos")
        .select("image")
        .where("shot_id", "=", id)
        .where("user_id", "=", userId)
        .executeTakeFirst();
      previousKey = existing?.image ?? null;
    }

    if (newImageKey) {
      const updated = await db
        .updateTable("photos")
        .set({ image: newImageKey, format: format ?? null })
        .where("shot_id", "=", id)
        .where("user_id", "=", userId)
        .returningAll()
        .executeTakeFirst();
      if (updated) {
        response.src = buildImageUrl(updated.image, userId) ?? "";
        response.format = updated.format ?? "";
        if (previousKey) await removeStoredFile(previousKey);
      }
    } else if (format) {
      const updated = await db
        .updateTable("photos")
        .set({ format })
        .where("shot_id", "=", id)
        .where("user_id", "=", userId)
        .returningAll()
        .executeTakeFirst();
      if (updated) response.format = updated.format ?? "";
    }

    res.json(response);
  },

  async delete(req: Request, res: Response): Promise<void> {
    const userId = userIdFromRequest(req);
    const id = Number(req.params.id);
    const status: { id: number; status?: string; message?: string } = { id };

    await db
      .deleteFrom("shot")
      .where("id", "=", id)
      .where("user_id", "=", userId)
      .execute();

    const removed = await db
      .deleteFrom("photos")
      .where("shot_id", "=", id)
      .where("user_id", "=", userId)
      .returningAll()
      .execute();

    if (removed.length) {
      await Promise.all(removed.map((p) => removeStoredFile(p.image)));
      status.message = `Removed ${removed.length} photos`;
    } else {
      await db
        .updateTable("photos")
        .set({ shot_id: null })
        .where("shot_id", "=", id)
        .where("user_id", "=", userId)
        .execute();
      status.message = "Photos was not removed";
    }
    status.status = "success";
    res.json(status);
  },
};
