import type { Request, Response } from "express";
import type { Contact } from "@klim/shared";
import { db } from "../db/index.js";
import { DomainError } from "../errors.js";
import { filesOf, userIdFromRequest } from "../global/helper.js";
import { buildImageUrl, storageKeyOf } from "../storage/index.js";

const CONTACT_KEY = "contact";

function withImageUrl(raw: string, userId: number): Contact {
  const contact = JSON.parse(raw) as Contact;
  if (contact.image) contact.image = buildImageUrl(contact.image, userId) ?? undefined;
  return contact;
}

export const contactController = {
  async createContact(req: Request, res: Response): Promise<void> {
    const userId = userIdFromRequest(req);
    const files = filesOf(req);
    const image = files.length ? storageKeyOf(files[0]) : undefined;

    const data: Contact = { ...req.body, image: image ?? undefined };

    const created = await db
      .insertInto("general")
      .values({ name: CONTACT_KEY, data: JSON.stringify(data), user_id: userId })
      .returningAll()
      .execute();

    res.json(created);
  },

  async getContact(req: Request, res: Response): Promise<void> {
    const userId = userIdFromRequest(req);

    const row = await db
      .selectFrom("general")
      .select("data")
      .where("name", "=", CONTACT_KEY)
      .where("user_id", "=", userId)
      .executeTakeFirst();

    if (!row?.data) throw new DomainError("Something went wrong", 500);
    res.json(withImageUrl(row.data, userId));
  },

  async updateContact(req: Request, res: Response): Promise<void> {
    const userId = userIdFromRequest(req);
    const files = filesOf(req);

    let image: string | undefined;
    if (files.length) {
      image = storageKeyOf(files[0]) ?? undefined;
    } else {
      // Keep the existing image when no new file is uploaded.
      const existing = await db
        .selectFrom("general")
        .select("data")
        .where("name", "=", CONTACT_KEY)
        .where("user_id", "=", userId)
        .executeTakeFirst();
      if (existing?.data) {
        image = (JSON.parse(existing.data) as Contact).image;
      }
    }

    const data: Contact = { ...req.body, image };

    const updated = await db
      .updateTable("general")
      .set({ name: CONTACT_KEY, data: JSON.stringify(data) })
      .where("user_id", "=", userId)
      .returning("data")
      .executeTakeFirst();

    if (!updated?.data) throw new DomainError("Something went wrong", 500);
    res.json(withImageUrl(updated.data, userId));
  },
};
