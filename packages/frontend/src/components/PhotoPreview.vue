<template>
  <router-link :class="['photo-preview', classes]" :to="{ path: '/photo/' + collection.id }">
    <div class="grid-container">
      <div :class="['grid-type', { 'grid-type--big-on-left': collectionType === 'left' && !isVertical, 'grid-type--big-on-right': collectionType === 'right' && !isVertical, 'grid-type--oneline': isVertical }]">
        <figure class="grid__item" v-for="(image, index) in photos" :key="index">
          <img :src="image.src" class="grid__img" loading="lazy" />
        </figure>
      </div>
    </div>
    <h2 v-if="collection.title && !isHideTitle" class="photo-preview__title">{{ collection.title }}</h2>
    <slot></slot>
    <slot name="category"></slot>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { PhotoCollection } from "@/models";

const props = withDefaults(defineProps<{
  collection: PhotoCollection;
  collectionType?: string;
  classes?: string;
  isHideTitle?: boolean;
}>(), { collectionType: "left", isHideTitle: false });

const photos = computed(() => {
  const previews = props.collection.photos.filter(v => v.isPreview);
  return previews.length ? previews.slice(0, 3) : [];
});

const isVertical = computed(() => photos.value.slice(0, 3).every(v => v.format === "vertical"));
</script>
