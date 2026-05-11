import { RepositoryFactory } from "../../repositories/RepositoryFactory";
const PhotosRepository = RepositoryFactory.get("photos");
const CategoriesRepository = RepositoryFactory.get("categories");
import { categories } from "@/helper/constants";

export default {
  state: {
    photos: null,
    categories: categories
  },
  getters: {
    photosPersonal(state) {
      return state.photos?.filter(item =>
        item?.categories?.includes("personal")
      );
    },
    photographerPhotos(state, getters) {
      // for /photos we should use personal category from an array
      return getters?.photosPersonal;
    },
    cinematographerPhotos(state) {
      return state.photos;
    },
    cinematographerPhotosCommerce(state) {
      return state.photos?.filter(item =>
        item?.categories?.includes("commerce")
      );
    }
  },
  actions: {
    async getPhotos({ commit }) {
      try {
        const { data } = await PhotosRepository.get();
        commit("setPhotos", data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    },
    async getCategories({ commit }) {
      try {
        const { data } = await CategoriesRepository.get();
        commit("setPhotos", data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  },
  mutations: {
    setPhotos(state, photos) {
      state.photos = photos;
    },
    setCategories(state, photos) {
      state.categories = photos;
    }
  }
};
