import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { DomainError } from "../errors.js";
import { filesOf, userIdFromRequest } from "../global/helper.js";
import {
  buildImageUrl,
  removeStoredFile,
  removeUploadedFiles,
  storageKeyOf,
  stripImageUrl,
} from "../storage/index.js";
import type {
  CreateWorkInput,
  UpdateWorkInput,
} from "../schemas/index.js";

interface WorkRow {
  id: number;
  title: string | null;
  videos: string | null;
  credits: string | null;
  work_order: number | null;
  description: string | null;
  category: string[] | null;
  photos: number[] | null;
  user_id: number | null;
}

function mapWork(row: WorkRow) {
  const { work_order, ...rest } = row;
  return { ...rest, order: work_order ?? 0 };
}

function mapWorkPhoto(
  p: { id: number; work_id: number | null; image: string | null; is_work_preview: boolean | null; work_order: number | null; format: string | null },
  userId: number,
) {
  return {
    id: p.id,
    work_id: p.work_id,
    src: buildImageUrl(p.image, userId),
    isPreview: p.is_work_preview,
    order: p.work_order,
    format: p.format ?? null,
  };
}

export const workController = {
  async create(req: Request, res: Response): Promise<void> {
    const userId = userIdFromRequest(req);
    const { title, description, credits, videos, photosInfo, order } =
      req.body as CreateWorkInput;
    const files = filesOf(req);
    if (!files.length) throw new DomainError("No files", 400);
    const keys = files.map((f) => storageKeyOf(f));

    let workId: number | undefined;
    try {
      const work = await db
        .insertInto("work")
        .values({
          title,
          videos,
          description,
          credits,
          work_order: order,
          user_id: userId,
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      workId = work.id;

      const photoRows = photosInfo.map((p, i) => ({
        work_id: workId as number,
        is_work_preview: p.isPreview ?? false,
        work_order: p.order ?? null,
        format: p.format ?? null,
        image: keys[i] ?? null,
        user_id: userId,
      }));
      const photos = await db
        .insertInto("photos")
        .values(photoRows)
        .returning("id")
        .execute();

      const updated = await db
        .updateTable("work")
        .set({ photos: photos.map((p) => p.id) })
        .where("id", "=", workId)
        .returningAll()
        .executeTakeFirstOrThrow();

      res.json(mapWork(updated as WorkRow));
    } catch (err) {
      await removeUploadedFiles(files);
      if (workId) await db.deleteFrom("work").where("id", "=", workId).execute();
      throw err;
    }
  },

  async getWork(req: Request, res: Response): Promise<void> {
    const userId = userIdFromRequest(req);
    const id = Number(req.params.id);

    const work = await db
      .selectFrom("work")
      .selectAll()
      .where("id", "=", id)
      .where("user_id", "=", userId)
      .executeTakeFirst();

    if (!work) throw new DomainError("Work is not exist", 404);

    const photos = await db
      .selectFrom("photos")
      .selectAll()
      .where("work_id", "=", id)
      .where("user_id", "=", userId)
      .execute();

    const result = mapWork(work as WorkRow) as Record<string, unknown>;
    if (photos.length) {
      result.photos = photos.map((p) => mapWorkPhoto(p, userId));
    }
    res.json(result);
  },

  async getWorks(req: Request, res: Response): Promise<void> {
    const userId = userIdFromRequest(req);

    const works = await db
      .selectFrom("work")
      .selectAll()
      .where("user_id", "=", userId)
      .execute();
    const photos = await db
      .selectFrom("photos")
      .selectAll()
      .where("work_id", "is not", null)
      .where("user_id", "=", userId)
      .execute();

    const mapped = photos.map((p) => mapWorkPhoto(p, userId));

    res.json(
      works.map((work) => {
        const w = mapWork(work as WorkRow);
        return {
          ...w,
          photos: mapped
            .filter((p) => p.work_id === w.id)
            .map(({ work_id: _work_id, ...rest }) => rest),
        };
      }),
    );
  },

  async update(req: Request, res: Response): Promise<void> {
    const userId = userIdFromRequest(req);
    const { id, title, credits, description, videos, photosInfo, order } =
      req.body as UpdateWorkInput;
    const workId = id;

    const newPhotos = photosInfo.new ?? [];
    const updatedPhotos = photosInfo.updated ?? [];
    const deletedPhotos = photosInfo.deleted ?? [];

    const files = filesOf(req);
    const keptIds: number[] = [];

    try {
      // CREATE new photos
      if (newPhotos.length) {
        const keys = files.map((f) => storageKeyOf(f));
        const rows = newPhotos.map((p, i) => ({
          work_id: workId,
          is_work_preview: p.isPreview ?? false,
          work_order: p.order ?? null,
          format: p.format ?? null,
          image: keys[i] ?? null,
          user_id: userId,
        }));
        const inserted = await db
          .insertInto("photos")
          .values(rows)
          .returning("id")
          .execute();
        keptIds.push(...inserted.map((r) => r.id));
      }

      // UPDATE existing photos (one parameterized statement each)
      for (const p of updatedPhotos) {
        await db
          .updateTable("photos")
          .set({
            image: stripImageUrl(p.src),
            format: p.format ?? null,
            work_id: workId,
            work_order: p.order ?? null,
            is_work_preview: p.isPreview ?? false,
            user_id: userId,
          })
          .where("id", "=", p.id)
          .execute();
        keptIds.push(p.id);
      }

      // DELETE removed photos
      if (deletedPhotos.length) {
        await db
          .deleteFrom("photos")
          .where("id", "in", deletedPhotos)
          .execute();
      }

      await db
        .updateTable("work")
        .set({
          title,
          credits,
          description,
          videos,
          photos: keptIds,
          work_order: order,
        })
        .where("id", "=", id)
        .where("user_id", "=", userId)
        .execute();

      res.status(200).json({ message: "Work is updated" });
    } catch (err) {
      await removeUploadedFiles(files);
      throw err;
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    const userId = userIdFromRequest(req);
    const id = Number(req.params.id);
    const status: { id: number; status?: string; message?: string } = { id };

    await db
      .deleteFrom("work")
      .where("id", "=", id)
      .where("user_id", "=", userId)
      .execute();

    const removedPhotos = await db
      .deleteFrom("photos")
      .where("work_id", "=", id)
      .where("photo_id", "is", null)
      .where("shot_id", "is", null)
      .where("user_id", "=", userId)
      .returningAll()
      .execute();

    if (removedPhotos.length) {
      await Promise.all(removedPhotos.map((p) => removeStoredFile(p.image)));
      status.message = `Removed ${removedPhotos.length} photos`;
    } else {
      await db
        .updateTable("photos")
        .set({ work_id: null })
        .where("work_id", "=", id)
        .where("user_id", "=", userId)
        .execute();
      status.message =
        "Photos was not removed - saved for other categories or dosn't exist";
    }
    status.status = "success";
    res.json(status);
  },
};
