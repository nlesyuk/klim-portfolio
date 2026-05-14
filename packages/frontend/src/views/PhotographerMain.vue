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
import { usePhotosQuery } from "@/composables/usePhotos";
import { setTitle } from "@/helper";

const route = useRoute();
const { data } = usePhotosQuery();

const allPhotos = computed(() => {
  const photos = data.value;
  const category = route.query.filter as string | undefined;
  const byCat = (key: string) => photos?.filter((item) => item.categories?.includes(key));
  const filtered = {
    all: photos,
    automotive: byCat("automotive"),
    fashion: byCat("fashion"),
    lifestyle: byCat("lifestyle"),
    personal: byCat("personal"),
  } as const;
  return filtered[category as keyof typeof filtered] ?? photos;
});

onMounted(() => { setTitle("Portfolio"); });
</script>
