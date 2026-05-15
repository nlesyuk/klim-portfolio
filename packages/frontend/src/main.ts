import { createApp } from "vue";
import { createPinia } from "pinia";
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";
import App from "./App.vue";
import router from "./router";
import "./registerServiceWorker";
import "@/scss/style.scss";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin, { queryClient });
app.mount("#app");
