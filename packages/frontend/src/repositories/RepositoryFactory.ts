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
  categories: CategoriesRepository
};

export const RepositoryFactory = {
  get: name => repositories[name]
};

export default RepositoryFactory;
