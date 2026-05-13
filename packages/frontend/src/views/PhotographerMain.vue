<template>
  <div class="home">
    <Slider />
    <PhotosPreviewGrid v-if="allPhotos && allPhotos.length" :photos="allPhotos" />
    <p v-else-if="allPhotos && allPhotos.length === 0" class="home__empty-category">
      Don't have any photo collections yet
    </p>
    <Spiner v-else />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import PhotosPreviewGrid from "@/components/PhotosPreviewGrid.vue";
import Slider from "@/views/Slider.vue";
import Spiner from "@/components/Spiner.vue";
import { usePhotosStore } from "@/stores/photos";
import { setTitle } from "@/helper";

const route = useRoute();
const photosStore = usePhotosStore();

const allPhotos = computed(() => {
  const photos = photosStore.photos as Record<string, unknown>[] | null;
  const category = route.query.filter as string | undefined;
  const filtered: Record<string, Record<string, unknown>[] | null | undefined> = {
    all: photos,
    automotive: photos?.filter((item) => (item.categories as string[] | undefined)?.includes("automotive")),
    fashion: photos?.filter((item) => (item.categories as string[] | undefined)?.includes("fashion")),
    lifestyle: photos?.filter((item) => (item.categories as string[] | undefined)?.includes("lifestyle")),
    personal: photos?.filter((item) => (item.categories as string[] | undefined)?.includes("personal")),
  };
  return filtered[category ?? ""] ?? photos;
});

onMounted(() => {
  setTitle("Portfolio");
  if (!photosStore.photos) photosStore.getPhotos();
});
</script>
