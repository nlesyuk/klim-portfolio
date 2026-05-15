<template>
  <div class="photos">
    <template v-if="photos && photos.length">
      <PhotoPreview
        v-for="(photo, idx) in photos"
        :key="idx"
        :collection="photo"
        :collection-type="idx % 2 ? 'left' : 'right'"
      />
    </template>
    <p v-else-if="photos && photos.length === 0" class="home__empty-category">
      Don't have any photos yet
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
import { isCinematographerMode } from "@/helper/constants";
import { setTitle } from "@/helper";

const route = useRoute();
const { data } = usePhotosQuery();

const photos = computed(() => {
  const all = data.value;
  if (!all) return undefined;
  const base = isCinematographerMode
    ? all
    : all.filter((item) => item.categories?.includes("personal"));
  const sorted = [...base].sort((a, b) => b.order - a.order);
  if (route.name === "commerce") {
    return sorted.filter((item) => item.categories?.includes("commerce"));
  }
  return sorted;
});

onMounted(() => {
  setTitle("Photos");
});
</script>
