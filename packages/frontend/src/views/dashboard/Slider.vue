<template>
  <section class="dashboard-slider">
    <button class="dashboard__btn" @click="isShowAddSlide = !isShowAddSlide">Add slide</button>
    <SlideAdd
      v-if="isShowAddSlide"
      :isEdit="isEdit"
      :slide="slide"
      :slides="slides"
      :works="videos"
      :photos="photos"
    />
    <button type="button" @click="onRefresh" class="dashboard__btn">Refresh slides</button>
    <Slides
      v-if="sortedSlides && sortedSlides.length"
      :slides="sortedSlides"
      @delete="onDelete"
      @edit="onEdit"
    />
    <div v-else-if="sortedSlides && sortedSlides.length === 0" class="grid-empty">
      Don't have any items yet
    </div>
    <Spiner v-else />
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import SlideAdd from "./SlideAdd.vue";
import Slides from "@/components/Slides.vue";
import Spiner from "@/components/Spiner.vue";
import { useSlidesQuery, useDeleteSlide } from "@/composables/useSlides";
import { useVideosQuery } from "@/composables/useVideos";
import { usePhotosQuery } from "@/composables/usePhotos";
import { queryKeys } from "@/queries/keys";
import type { Slide } from "@/models";

const qc = useQueryClient();
const { data: slidesData } = useSlidesQuery();
const { data: videosData } = useVideosQuery();
const { data: photosData } = usePhotosQuery();
const { mutate: deleteSlide } = useDeleteSlide();

const slide = ref<Slide | undefined>(undefined);
const isEdit = ref(false);
const isShowAddSlide = ref(false);

const slides = computed(() => slidesData.value);
const videos = computed(() => videosData.value);
const photos = computed(() => photosData.value);

const sortedSlides = computed(() => {
  const s = slides.value;
  if (!s) return s;
  return [...s].sort((a, b) => b.order - a.order);
});

function onRefresh() { qc.invalidateQueries({ queryKey: queryKeys.slides() }); }

function onDelete(id: number) { deleteSlide(id); }

function onEdit(id: number) {
  isEdit.value = true;
  const item = slides.value?.filter((v) => v.id === id);
  slide.value = item?.length ? item[0] : undefined;
  isShowAddSlide.value = true;
}
</script>
