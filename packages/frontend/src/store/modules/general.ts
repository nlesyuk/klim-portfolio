import { RepositoryFactory } from "../../repositories/RepositoryFactory";
const RepositoryGeneral = RepositoryFactory.get("general");

export default {
  state: {
    contacts: null
  },
  actions: {
    async getContacts({ commit }) {
      try {
        const { data } = await RepositoryGeneral.getContacts();
        commit("setContacts", data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  },
  mutations: {
    setContacts(state, contacts) {
      state.contacts = contacts;
    }
  },
  getters: {
    theme(state) {
      return state.contacts?.theme;
    }
  }
};
