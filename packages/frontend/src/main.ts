import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";

// global components
import Spiner from "./components/Spiner.vue";
import Error from "./views/Error.vue";
Vue.component("Spiner", Spiner);
Vue.component("Error", Error);

// plugins
import messagePlugin from "./utils/message.plugin";
Vue.use(messagePlugin);
import VueStripeMenu from "vue-stripe-menu";
Vue.use(VueStripeMenu);
import "vue-stripe-menu/dist/vue-stripe-menu.css";

import SimpleLightbox from "simple-lightbox";
globalThis.SimpleLightbox = SimpleLightbox;
require("../node_modules/simple-lightbox/dist/simpleLightbox.min.css");

import Vuelidate from "vuelidate";
Vue.use(Vuelidate);

// styles
import "@/scss/style.scss";

Vue.config.productionTip = false;
new Vue({
  router,
  store,
  render: h => h(App),
  mounted() {
    this.$store.dispatch("init");
  }
}).$mount("#app");
