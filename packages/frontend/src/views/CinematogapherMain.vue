<template>
  <div class="home">
    <Slider />
    <WorksGrid v-if="allVideos && allVideos.length" :works="allVideos" />
    <p v-else-if="allVideos && allVideos.length === 0" class="home__empty-category">
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
import { useVideosStore } from "@/stores/videos";
import { setTitle } from "@/helper";

const route = useRoute();
const videosStore = useVideosStore();

const allVideos = computed(() => {
  if (route.name === "works-commercial") {
    if (!videosStore.videos) return undefined;
    return (videosStore.videos as Record<string, unknown>[]).filter((v) =>
      (v.category as string[] | undefined)?.includes("commerce")
    );
  }
  return videosStore.videos;
});

onMounted(() => {
  setTitle("Works");
  if (!videosStore.videos) videosStore.getAllVideos();
});
</script>
