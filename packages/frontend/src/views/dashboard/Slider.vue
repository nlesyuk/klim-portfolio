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

const qc = useQueryClient();
const { data: slidesData } = useSlidesQuery();
const { data: videosData } = useVideosQuery();
const { data: photosData } = usePhotosQuery();
const { mutate: deleteSlide } = useDeleteSlide();

const slide = ref<unknown>(null);
const isEdit = ref(false);
const isShowAddSlide = ref(false);

const slides = computed(() => slidesData.value as Record<string, unknown>[] | undefined);
const videos = computed(() => videosData.value as Record<string, unknown>[] | undefined);
const photos = computed(() => photosData.value as Record<string, unknown>[] | undefined);

const sortedSlides = computed(() => {
  const s = slides.value;
  if (!s) return s;
  return [...s].sort((a, b) => (b.order as number) - (a.order as number));
});

function onRefresh() { qc.invalidateQueries({ queryKey: queryKeys.slides() }); }

function onDelete(id: unknown) { deleteSlide(id); }

function onEdit(id: unknown) {
  isEdit.value = true;
  const item = slides.value?.filter((v) => v.id === id);
  slide.value = item?.length ? item[0] : null;
  isShowAddSlide.value = true;
}
</script>
