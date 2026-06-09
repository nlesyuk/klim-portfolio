<template>
  <div v-if="photos.length" class="works">
    <figure
      v-for="item in sortedPhotos"
      :key="item.title"
      class="work"
      :style="getPreviewStyle(item.id)"
      style="cursor: pointer"
      @click="router.push({ path: `/photo/${item.id}` })"
    >
      <div class="work__description">
        <h2 class="work__title">{{ item.title }}</h2>
      </div>
    </figure>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import type { PhotoCollection } from "@/models";

const props = defineProps<{ photos: PhotoCollection[] }>();
const router = useRouter();

const sortedPhotos = computed(() =>
  [...props.photos].sort((a, b) => a.order - b.order),
);

function getFirstPreviewPhoto(id: number) {
  const col = props.photos.find((v) => v.id === id);
  if (!col) return "";
  const previews = col.photos
    .filter((v) => v.isPreview)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return previews[0]?.src ?? "";
}

function getPreviewStyle(id: number) {
  return `background-image: url(${getFirstPreviewPhoto(id)})`;
}
</script>
