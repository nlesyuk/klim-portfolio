<template>
  <component :is="component"></component>
</template>

<script>
import CinematogapherMain from "./CinematogapherMain.vue";
import PhotographerMain from "./PhotographerMain.vue";
import { domain } from "@/helper/constants";

export default {
  name: "Main",
  components: {
    CinematogapherMain,
    PhotographerMain
  },
  computed: {
    component() {
      const config = {
        "klimstepan.com": "CinematogapherMain",
        "derzhanovska.com": "PhotographerMain"
      };

      return config[domain] || "CinematogapherMain";
    }
  }
};
</script>
