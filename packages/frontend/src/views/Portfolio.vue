<template>
  <div class="home">
    <template v-if="allPhotos && allPhotos.length">
      <PhotoPreview
        v-for="(photo, idx) in allPhotos"
        :key="idx"
        :collection="photo"
        :collectionType="idx % 2 ? 'left' : 'right'"
      />
    </template>
    <p v-else-if="allPhotos && allPhotos.length === 0" class="home__empty-category">
      Don't have any photo collections yet
    </p>
    <Spiner v-else />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import PhotoPreview from "@/components/PhotoPreview.vue";
import Spiner from "@/components/Spiner.vue";
import { usePhotosStore } from "@/stores/photos";
import { setTitle } from "@/helper";

const route = useRoute();
const photosStore = usePhotosStore();

const allPhotos = computed(() => {
  const photos = photosStore.photos as Record<string, unknown>[] | null;
  const category = route.query.filter as string | undefined;
  if (category === "all" || !category) return photos;
  return photos?.filter((item) => (item.categories as string[] | undefined)?.includes(category)) ?? photos;
});

onMounted(() => {
  setTitle("Portfolio");
  if (!photosStore.photos) photosStore.getPhotos();
});
</script>
