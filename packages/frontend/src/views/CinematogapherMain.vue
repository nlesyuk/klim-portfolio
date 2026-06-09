<template>
  <div class="home">
    <Slider />
    <WorksGrid v-if="allVideos && allVideos.length" :works="allVideos" />
    <p
      v-else-if="allVideos && allVideos.length === 0"
      class="home__empty-category"
    >
      Don't have any works yet
    </p>
    <Spiner v-else />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import WorksGrid from "@/components/WorksGrid.vue";
import Slider from "@/views/Slider.vue";
import Spiner from "@/components/Spiner.vue";
import { useVideosQuery } from "@/composables/useVideos";
import { setTitle } from "@/helper";

const route = useRoute();
const { data } = useVideosQuery();

const allVideos = computed(() => {
  if (route.name === "works-commercial") {
    if (!data.value) return undefined;
    return data.value.filter((v) => v.category?.includes("commerce"));
  }
  return data.value;
});

onMounted(() => {
  setTitle("Works");
});
</script>
