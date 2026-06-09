import type { Request, Response } from "express";
import { z } from "zod";
import type { Selectable } from "kysely";
import type { Slide } from "@klim/shared";
import { db } from "../db/index.js";
import type { SlidesTable } from "../db/schema.js";
import { DomainError } from "../errors.js";
import {
  filesOf,
  prepareSlideDataForClient,
  userIdFromRequest,
} from "../global/helper.js";
import {
  buildImageUrl,
  removeStoredFile,
  removeUploadedFiles,
  storageKeyOf,
} from "../storage/index.js";
import { CreateSlideInput, UpdateSlideInput } from "../schemas/index.js";

// get/getById historically JSON.parse the videos blob; create/update return it
// raw. Preserve that by parsing only here, defensively.
function mapSlideForGet(row: Selectable<SlidesTable>, userId: number): Slide {
  let videos: Slide["videos"] = row.videos ?? null;
  if (typeof videos === "string") {
    try {
      videos = JSON.parse(videos);
    } catch {
      /* keep raw string */
    }
  }
  return {
    id: row.id,
    type: (row.type as Slide["type"]) ?? "image",
    title: row.title ?? "",
    image: buildImageUrl(row.image, userId),
    order: row.slide_order ?? 0,
    videos,
    workId: row.work_id,
    photoId: row.photo_id,
  };
}

export const sliderController = {
  async create(req: Request, res: Response): Promise<void> {
    const userId = userIdFromRequest(req);
    const { title, type, order, videos, workId, photoId } = req.body as z.infer<
      typeof CreateSlideInput
    >;
    if (type === "video" && !videos) {
      throw new DomainError("video is required");
    }
    const files = filesOf(req);
    const image = files.length ? storageKeyOf(files[0]) : null;

    try {
      const created = await db
        .insertInto("slides")
        .values({
          title,
          slide_order: order,
          work_id: workId ?? null,
          photo_id: photoId ?? null,
          image,
          type,
          videos: videos ?? null,
          user_id: userId,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      res.status(200).json(prepareSlideDataForClient(created, userId));
    } catch (err) {
      await removeUploadedFiles(files);
      throw err;
    }
  },

  async get(req: Request, res: Response): Promise<void> {
    const userId = userIdFromRequest(req);
    const slides = await db
      .selectFrom("slides")
      .selectAll()
      .where("user_id", "=", userId)
      .execute();
    res.status(200).json(slides.map((s) => mapSlideForGet(s, userId)));
  },

  async getById(req: Request, res: Response): Promise<void> {
    const userId = userIdFromRequest(req);
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new DomainError("id is required or id is incorrect");
    }

    const slide = await db
      .selectFrom("slides")
      .selectAll()
      .where("id", "=", id)
      .where("user_id", "=", userId)
      .executeTakeFirst();

    if (!slide) {
      res.status(200).send({ message: "Do not find slide" });
      return;
    }
    res.status(200).json(mapSlideForGet(slide, userId));
  },

  async update(req: Request, res: Response): Promise<void> {
    const userId = userIdFromRequest(req);
    const { id, title, type, order, videos, workId, photoId } =
      req.body as z.infer<typeof UpdateSlideInput>;
    if (type === "video" && !videos) {
      throw new DomainError("video is required");
    }
    const files = filesOf(req);

    const base = {
      type,
      title,
      slide_order: order,
      work_id: workId ?? null,
      photo_id: photoId ?? null,
    };

    try {
      if (type === "image") {
        const newImageKey = files.length ? storageKeyOf(files[0]) : null;
        if (newImageKey) {
          const old = await db
            .selectFrom("slides")
            .select("image")
            .where("id", "=", id)
            .where("user_id", "=", userId)
            .executeTakeFirst();
          const updated = await db
            .updateTable("slides")
            .set({ ...base, image: newImageKey })
            .where("id", "=", id)
            .where("user_id", "=", userId)
            .returningAll()
            .executeTakeFirstOrThrow();
          if (old?.image) await removeStoredFile(old.image);
          res.status(200).json(prepareSlideDataForClient(updated, userId));
        } else {
          const updated = await db
            .updateTable("slides")
            .set(base)
            .where("id", "=", id)
            .where("user_id", "=", userId)
            .returningAll()
            .executeTakeFirstOrThrow();
          res.status(200).json(prepareSlideDataForClient(updated, userId));
        }
      } else {
        const updated = await db
          .updateTable("slides")
          .set({ ...base, videos: videos ?? null })
          .where("id", "=", id)
          .where("user_id", "=", userId)
          .returningAll()
          .executeTakeFirstOrThrow();
        res.status(200).json(prepareSlideDataForClient(updated, userId));
      }
    } catch (err) {
      await removeUploadedFiles(files);
      throw err;
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    const userId = userIdFromRequest(req);
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new DomainError("id is required or id is incorrect");
    }

    const deleted = await db
      .deleteFrom("slides")
      .where("id", "=", id)
      .where("user_id", "=", userId)
      .returningAll()
      .executeTakeFirst();

    if (deleted?.type === "image" && deleted.image) {
      await removeStoredFile(deleted.image);
    }
    res.status(200).json({ message: "slide deleted", id: deleted?.id });
  },
};
