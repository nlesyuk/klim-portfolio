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
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useQuery } from "@tanstack/vue-query";
import PhotosGrid from "@/components/PhotosGrid.vue";
import Spiner from "@/components/Spiner.vue";
import { queryKeys } from "@/queries/keys";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";
import { setTitle } from "@/helper";
import type { PhotoCollection } from "@/models";

const PhotosRepo = RepositoryFactory.get("photos");
const route = useRoute();

const photoId = computed(() => +String(route.params.id));

const { data: photo } = useQuery<PhotoCollection>({
  queryKey: computed(() => [...queryKeys.photos(), photoId.value]),
  queryFn: () => PhotosRepo.getById(photoId.value).then((r) => r.data),
  enabled: computed(() => !!photoId.value),
});

const firstPhotos = computed(() => {
  const previews = photo.value?.photos?.filter((v) => v.isPreview);
  return previews?.length ? previews : [];
});

const restPhotos = computed(() => {
  const previews = photo.value?.photos?.filter((v) => !v.isPreview);
  return previews?.length ? previews : [];
});

onMounted(() => { setTitle("Photo"); });
</script>
