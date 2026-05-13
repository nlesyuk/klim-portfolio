<template>
  <component :is="component" />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { domain } from "@/helper/constants";

const CinematogapherMain = defineAsyncComponent(() => import("./CinematogapherMain.vue"));
const PhotographerMain = defineAsyncComponent(() => import("./PhotographerMain.vue"));

const config: Record<string, ReturnType<typeof defineAsyncComponent>> = {
  "klimstepan.com": CinematogapherMain,
  "derzhanovska.com": PhotographerMain,
};

const component = computed(() => config[domain] ?? CinematogapherMain);
</script>
