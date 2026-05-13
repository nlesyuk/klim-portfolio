<template>
  <div class="works" v-if="photos.length">
    <figure
      class="work"
      v-for="item in sortedPhotos"
      :key="item.title"
      :style="getPreviewStyle(item.id)"
      @click="router.push({ path: `/photo/${item.id}` })"
      style="cursor:pointer"
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

type PhotoCollection = { id: number; title: string; order: number; photos: { isPreview: boolean; src: string; order: number }[] };

const props = defineProps<{ photos: PhotoCollection[] }>();
const router = useRouter();

const sortedPhotos = computed(() => [...props.photos].sort((a, b) => a.order - b.order));

function getFirstPreviewPhoto(id: number) {
  const col = props.photos.find(v => v.id === id);
  if (!col) return "";
  const previews = col.photos.filter(v => v.isPreview).sort((a, b) => a.order - b.order);
  return previews[0]?.src ?? "";
}

function getPreviewStyle(id: number) {
  return `background-image: url(${getFirstPreviewPhoto(id)})`;
}
</script>
