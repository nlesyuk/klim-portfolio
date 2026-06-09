import type { ColumnType, Generated } from "kysely";

// Hand-written from db/database.sql (Phase 4). When prod DB credentials are
// available, regenerate with `npm run db:codegen` and replace this file.
//
// Note: most columns are nullable in the DDL (no NOT NULL constraints beyond
// the SERIAL primary keys), so they are typed `T | null`.

type Nullable<T> = ColumnType<T | null, T | null | undefined, T | null>;

export interface GeneralTable {
  id: Generated<number>;
  // varchar in DDL, but the app stores numeric user ids — pg coerces.
  user_id: Nullable<number>;
  name: Nullable<string>;
  data: Nullable<string>;
}

export interface WorkTable {
  id: Generated<number>;
  title: Nullable<string>;
  videos: Nullable<string>; // JSON column; app round-trips an opaque blob
  credits: Nullable<string>;
  work_order: Nullable<number>;
  description: Nullable<string>;
  category: Nullable<string[]>;
  photos: Nullable<number[]>;
  user_id: Nullable<number>;
}

export interface ShotTable {
  id: Generated<number>;
  categories: Nullable<string[]>;
  work_id: Nullable<number>;
  user_id: Nullable<number>;
}

export interface PhotoTable {
  id: Generated<number>;
  title: Nullable<string>;
  description: Nullable<string>;
  credits: Nullable<string>;
  photo_order: Nullable<number>;
  categories: Nullable<string[]>;
  user_id: Nullable<number>;
}

export interface PhotosTable {
  id: Generated<number>;
  work_id: Nullable<number>;
  work_order: Nullable<number>;
  is_work_preview: Nullable<boolean>;
  work_categories: Nullable<string>;
  photo_id: Nullable<number>;
  photo_order: Nullable<number>;
  is_photo_preview: Nullable<boolean>;
  photo_categories: Nullable<string>;
  shot_id: Nullable<number>;
  shot_order: Nullable<number>;
  format: Nullable<string>;
  image: Nullable<string>;
  user_id: Nullable<number>;
}

export interface SlidesTable {
  id: Generated<number>;
  type: Nullable<string>;
  title: Nullable<string>;
  slide_order: Nullable<number>;
  image: Nullable<string>;
  videos: Nullable<string>;
  work_id: Nullable<number>;
  photo_id: Nullable<number>;
  user_id: Nullable<number>;
}

export interface UsersTable {
  id: Generated<number>;
  username: Nullable<string>;
  password: Nullable<string>;
  refresh_token: Nullable<string>;
  expiry_date: Nullable<string>;
}

export interface Database {
  general: GeneralTable;
  work: WorkTable;
  shot: ShotTable;
  photo: PhotoTable; // singular: photo-collection meta
  photos: PhotosTable; // plural: individual image files
  slides: SlidesTable;
  users: UsersTable;
}
