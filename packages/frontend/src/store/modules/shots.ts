import { RepositoryFactory } from "../../repositories/RepositoryFactory";
const RepositoryGeneral = RepositoryFactory.get("shots");

export default {
  state: {
    shots: [],
    categories: ["all", "portrait", "landscape", "mood"]
  },
  actions: {
    async getAllShots({ commit }) {
      try {
        const { data } = await RepositoryGeneral.getAllShots();
        commit("setShots", data);
        return Promise.resolve(data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return Promise.reject(e);
      }
    }
  },
  mutations: {
    setShots(state, shots) {
      state.shots = shots;
    }
  }
};
