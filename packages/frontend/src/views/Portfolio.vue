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
import { usePhotosQuery } from "@/composables/usePhotos";
import { setTitle } from "@/helper";

const route = useRoute();
const { data } = usePhotosQuery();

const allPhotos = computed(() => {
  const photos = data.value as Record<string, unknown>[] | undefined;
  const category = route.query.filter as string | undefined;
  if (category === "all" || !category) return photos;
  return photos?.filter((item) => (item.categories as string[] | undefined)?.includes(category)) ?? photos;
});

onMounted(() => { setTitle("Portfolio"); });
</script>
