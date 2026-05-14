<template>
  <div class="photos">
    <template v-if="photos && photos.length">
      <PhotoPreview
        v-for="(photo, idx) in photos"
        :key="idx"
        :collection="photo"
        :collectionType="idx % 2 ? 'left' : 'right'"
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
import PhotoPreview from "@/components/PhotoPreview.vue";
import Spiner from "@/components/Spiner.vue";
import { usePhotosQuery } from "@/composables/usePhotos";
import { isCinematographerMode } from "@/helper/constants";
import { setTitle } from "@/helper";

const { data } = usePhotosQuery();

const photos = computed(() => {
  const all = data.value;
  if (!all) return undefined;
  return isCinematographerMode
    ? all
    : all.filter((item) => item.categories?.includes("personal"));
});

onMounted(() => { setTitle("Photos"); });
</script>
