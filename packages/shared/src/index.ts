// Shared domain models — single source of truth for the FE↔BE HTTP contract.
// Mirrors packages/frontend/src/models/index.ts. Keep the two in sync.

export interface User {
  id: number;
  username: string;
  accessToken: string;
  refreshToken: string;
}

export type Category = string;

export type ImageFormat = "vertical" | "horizontal" | string;

export interface PhotoFile {
  id?: number;
  src: string;
  format?: ImageFormat;
  order?: number;
  isPreview?: boolean;
  photoId?: number;
  workId?: number;
  fileName?: string;
}

export type Photo = PhotoFile;

export interface PhotoCollection {
  id: number;
  title: string;
  order: number;
  credits?: string;
  description?: string;
  categories?: Category[];
  photos: PhotoFile[];
}

export interface Shot {
  id: number;
  src: string;
  workId?: number;
  categories: Category[];
  format?: ImageFormat;
}

export interface WorkVideos {
  vimeoId: string;
}

export interface Work {
  id: number;
  title: string;
  order: number;
  credits?: string;
  description?: string;
  category?: Category[];
  videos?: WorkVideos | string;
  photos: PhotoFile[];
}

export type SlideType = "image" | "video";

export interface Slide {
  id: number;
  title: string;
  order: number;
  type: SlideType;
  image?: string | null;
  videos?: WorkVideos | string | null;
  workId?: number | string | null;
  photoId?: number | string | null;
}

export interface Contact {
  email?: string;
  phone?: string;
  vimeo?: string;
  facebook?: string;
  telegram?: string;
  instagram?: string;
  description?: string;
  image?: string;
  theme?: string;
}

// Shape of photosInfo.* payloads sent on work/photo-collection writes.
export interface PhotoInfoNew {
  isPreview?: boolean;
  order?: number | null;
  format?: ImageFormat | null;
  fileName?: string;
}

export interface PhotoInfoUpdated {
  id: number;
  src: string;
  isPreview?: boolean;
  order?: number | null;
  format?: ImageFormat | null;
}

export interface PhotosInfo {
  new?: PhotoInfoNew[];
  updated?: PhotoInfoUpdated[];
  deleted?: number[];
  existing?: PhotoInfoUpdated[];
}
