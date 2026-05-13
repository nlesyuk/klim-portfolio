<template>
  <div class="photos">
    <template v-if="photo">
      <PhotosGrid :images="firstPhotos" />
      <h1 class="photos__title">{{ photo.title }}</h1>
      <p class="photos__description" v-html="photo.description"></p>
      <PhotosGrid :images="restPhotos" />
      <p class="photos__credits" v-html="photo.credits"></p>
    </template>
    <Spiner v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import PhotosGrid from "@/components/PhotosGrid.vue";
import Spiner from "@/components/Spiner.vue";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";
import { setTitle } from "@/helper";

const PhotosRepository = RepositoryFactory.get("photos");
const route = useRoute();

const photo = ref<Record<string, unknown> | null>(null);

const firstPhotos = computed(() => {
  const previews = (photo.value?.photos as Record<string, unknown>[] | undefined)?.filter((v) => v.isPreview);
  return previews?.length ? previews : [];
});

const restPhotos = computed(() => {
  const previews = (photo.value?.photos as Record<string, unknown>[] | undefined)?.filter((v) => !v.isPreview);
  return previews?.length ? previews : [];
});

onMounted(async () => {
  setTitle("Photo");
  try {
    const { data } = await PhotosRepository.getById(+String(route.params.id));
    photo.value = data;
  } catch (e) {
    console.error(e);
  }
});
</script>
