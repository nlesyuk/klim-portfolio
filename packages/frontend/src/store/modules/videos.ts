import { RepositoryFactory } from "../../repositories/RepositoryFactory";
const RepositoryGeneral = RepositoryFactory.get("videos");

export default {
  state: {
    videos: null
  },
  actions: {
    async getAllVideos({ commit }) {
      try {
        const { data } = await RepositoryGeneral.getAllVideos();
        commit("setVideos", data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  },
  mutations: {
    setVideos(state, videos) {
      state.videos = videos;
    }
  }
};
