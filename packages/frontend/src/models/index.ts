export interface User {
  id: number;
  username: string;
  accessToken: string;
  refreshToken: string;
}

export type Category = string;

export interface PhotoFile {
  id?: number;
  src: string;
  format?: "vertical" | "horizontal" | string;
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
  format?: "vertical" | "horizontal" | string;
  file?: File;
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
  videos?: WorkVideos;
  photos: PhotoFile[];
  deletedPhotoIds?: number[];
}

export type SlideType = "image" | "video";

export interface Slide {
  id: number;
  title: string;
  order: number;
  type: SlideType;
  image?: string;
  videos?: WorkVideos | string;
  workId?: number | string;
  photoId?: number | string;
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
