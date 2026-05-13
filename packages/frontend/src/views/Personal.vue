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
import { usePhotosStore } from "@/stores/photos";
import { isCinematographerMode } from "@/helper/constants";
import { setTitle } from "@/helper";

const photosStore = usePhotosStore();

const photos = computed(() =>
  isCinematographerMode
    ? photosStore.cinematographerPhotos
    : photosStore.photographerPhotos
);

onMounted(() => {
  setTitle("Photos");
  if (!photosStore.photos) photosStore.getPhotos();
});
</script>
