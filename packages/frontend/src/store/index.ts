import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

import general from "./modules/general";
import videos from "./modules/videos";
import photos from "./modules/photos";
import shots from "./modules/shots";
import slides from "./modules/slides";
import auth from "./modules/auth.module";

export default new Vuex.Store({
  actions: {
    init({ dispatch }) {
      dispatch("getContacts");
    }
  },
  modules: {
    general,
    videos,
    photos,
    shots,
    slides,
    auth
  }
});
