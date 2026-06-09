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
  CreatePhotoCollectionInput,
  UpdatePhotoCollectionInput,
} from "../schemas/index.js";

interface PhotoFileRow {
  id: number;
  photo_id: number | null;
  image: string | null;
  is_photo_preview: boolean | null;
  photo_order: number | null;
  format: string | null;
}

function mapPhoto(p: PhotoFileRow, userId: number) {
  return {
    id: p.id,
    photo_id: p.photo_id,
    src: buildImageUrl(p.image, userId),
    isPreview: p.is_photo_preview,
    order: p.photo_order,
    format: p.format ?? null,
  };
}

export const photoCollectionsController = {
  async create(req: Request, res: Response): Promise<void> {
    const userId = userIdFromRequest(req);
    const { title, description, credits, categories, photosInfo, order } =
      req.body as CreatePhotoCollectionInput;
    const files = filesOf(req);
    if (!files.length) throw new DomainError("No files", 400);
    const keys = files.map((f) => storageKeyOf(f));

    let recordId: number | undefined;
    try {
      const record = await db
        .insertInto("photo")
        .values({
          title,
          description,
          credits,
          categories,
          photo_order: order,
          user_id: userId,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      recordId = record.id;

      const rows = photosInfo.map((p, i) => ({
        photo_id: recordId as number,
        is_photo_preview: p.isPreview ?? false,
        photo_order: p.order ?? null,
        format: p.format ?? null,
        image: keys[i] ?? null,
        user_id: userId,
      }));
      const photos = await db
        .insertInto("photos")
        .values(rows)
        .returningAll()
        .execute();

      res.status(200).json({
        title: record.title,
        order: record.photo_order,
        credits: record.credits,
        description: record.description,
        photos: photos.map((p) => ({
          id: p.id,
          order: p.photo_order,
          format: p.format,
          isPreview: p.is_photo_preview,
          src: buildImageUrl(p.image, userId),
        })),
      });
    } catch (err) {
      await removeUploadedFiles(files);
      if (recordId)
        await db.deleteFrom("photo").where("id", "=", recordId).execute();
      throw err;
    }
  },

  async get(req: Request, res: Response): Promise<void> {
    const userId = userIdFromRequest(req);

    const records = await db
      .selectFrom("photo")
      .selectAll()
      .where("user_id", "=", userId)
      .execute();
    const photos = await db
      .selectFrom("photos")
      .selectAll()
      .where("photo_id", "is not", null)
      .where("user_id", "=", userId)
      .execute();

    const mapped = photos.map((p) => mapPhoto(p, userId));

    res.json(
      records.map((item) => {
        const { photo_order, description, ...rest } = item;
        return {
          ...rest,
          order: photo_order ?? 0,
          description: description ?? "",
          photos: mapped
            .filter((p) => p.photo_id === item.id)
            .map(({ photo_id: _photo_id, ...p }) => p),
        };
      }),
    );
  },

  async getById(req: Request, res: Response): Promise<void> {
    const userId = userIdFromRequest(req);
    const id = Number(req.params.id);

    const record = await db
      .selectFrom("photo")
      .selectAll()
      .where("id", "=", id)
      .where("user_id", "=", userId)
      .executeTakeFirst();
    if (!record) throw new DomainError("Photo collection doesn't exist", 404);

    const photos = await db
      .selectFrom("photos")
      .selectAll()
      .where("photo_id", "=", id)
      .where("user_id", "=", userId)
      .execute();

    const { photo_order, ...rest } = record;
    const result = { ...rest, order: photo_order ?? 0 } as Record<
      string,
      unknown
    >;
    if (photos.length) {
      result.photos = photos.map((p) => {
        const { photo_id: _photo_id, ...m } = mapPhoto(p, userId);
        return m;
      });
    }
    res.json(result);
  },

  async update(req: Request, res: Response): Promise<void> {
    const userId = userIdFromRequest(req);
    const { id, title, credits, description, categories, photosInfo, order } =
      req.body as UpdatePhotoCollectionInput;
    const recordId = id;

    const newPhotos = photosInfo.new ?? [];
    const updatedPhotos = photosInfo.updated ?? [];
    const deletedPhotos = photosInfo.deleted ?? [];
    const files = filesOf(req);

    try {
      if (newPhotos.length) {
        const keys = files.map((f) => storageKeyOf(f));
        const rows = newPhotos.map((p, i) => ({
          photo_id: recordId,
          is_photo_preview: p.isPreview ?? false,
          photo_order: p.order ?? null,
          format: p.format ?? null,
          image: keys[i] ?? null,
          user_id: userId,
        }));
        await db.insertInto("photos").values(rows).execute();
      }

      for (const p of updatedPhotos) {
        await db
          .updateTable("photos")
          .set({
            image: stripImageUrl(p.src),
            format: p.format ?? null,
            photo_id: recordId,
            photo_order: p.order ?? null,
            is_photo_preview: p.isPreview ?? false,
            user_id: userId,
          })
          .where("id", "=", p.id)
          .where("user_id", "=", userId)
          .execute();
      }

      if (deletedPhotos.length) {
        await db
          .deleteFrom("photos")
          .where("id", "in", deletedPhotos)
          .execute();
      }

      await db
        .updateTable("photo")
        .set({
          title,
          credits,
          description,
          photo_order: order,
          categories,
        })
        .where("id", "=", id)
        .where("user_id", "=", userId)
        .execute();

      res.status(200).json({ message: "Photo record is updated" });
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
      .deleteFrom("photo")
      .where("id", "=", id)
      .where("user_id", "=", userId)
      .execute();

    const removedPhotos = await db
      .deleteFrom("photos")
      .where("photo_id", "=", id)
      .where("work_id", "is", null)
      .where("shot_id", "is", null)
      .returningAll()
      .execute();

    if (removedPhotos.length) {
      await Promise.all(removedPhotos.map((p) => removeStoredFile(p.image)));
      status.message = `Removed ${removedPhotos.length} photos`;
    } else {
      await db
        .updateTable("photos")
        .set({ photo_id: null })
        .where("photo_id", "=", id)
        .execute();
      status.message =
        "Photos was not removed - saved for other categories or dosn't exist";
    }
    status.status = "success";
    res.json(status);
  },
};
