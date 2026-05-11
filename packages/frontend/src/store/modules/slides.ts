import { RepositoryFactory } from "../../repositories/RepositoryFactory";
const SlidesRepository = RepositoryFactory.get("slides");

export default {
  state: {
    slides: null
  },
  actions: {
    async getSlides({ commit }) {
      try {
        const { data } = await SlidesRepository.get();
        commit("setSlides", data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  },
  mutations: {
    setSlides(state, slides) {
      state.slides = slides;
    }
  }
};
