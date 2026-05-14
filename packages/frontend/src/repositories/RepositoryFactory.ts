import PhotosRepository from "./PhotosRepository";
import VideosRepository from "./VideosRepository";
import ShotsRepository from "./ShotsRepository";
import GeneralRepository from "./GeneralRepository";
import SlidesRepository from "./SlidesRepository";
import CategoriesRepository from "./CategoriesRepository";
import AuthRepository from "./AuthRepository";

const repositories = {
  auth: AuthRepository,
  shots: ShotsRepository,
  videos: VideosRepository,
  photos: PhotosRepository,
  slides: SlidesRepository,
  general: GeneralRepository,
  categories: CategoriesRepository,
} as const;

export type RepositoryName = keyof typeof repositories;

export const RepositoryFactory = {
  get<K extends RepositoryName>(name: K): typeof repositories[K] {
    return repositories[name];
  },
};

export default RepositoryFactory;
