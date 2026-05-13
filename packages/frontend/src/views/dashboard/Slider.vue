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
import { ref, computed, onMounted } from "vue";
import SlideAdd from "./SlideAdd.vue";
import Slides from "@/components/Slides.vue";
import Spiner from "@/components/Spiner.vue";
import { useSlidesStore } from "@/stores/slides";
import { useVideosStore } from "@/stores/videos";
import { usePhotosStore } from "@/stores/photos";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";

const SlidesRepository = RepositoryFactory.get("slides");
const slidesStore = useSlidesStore();
const videosStore = useVideosStore();
const photosStore = usePhotosStore();

const slide = ref<unknown>(null);
const isEdit = ref(false);
const isShowAddSlide = ref(false);

const slides = computed(() => slidesStore.slides as Record<string, unknown>[] | null);
const videos = computed(() => videosStore.videos as Record<string, unknown>[] | null);
const photos = computed(() => photosStore.photos as Record<string, unknown>[] | null);

const sortedSlides = computed(() => {
  const s = slides.value;
  if (!s) return s;
  return [...s].sort((a, b) => (b.order as number) - (a.order as number));
});

function onRefresh() { slidesStore.getSlides(); }

function onDelete(id: unknown) {
  SlidesRepository.delete(id)
    .then(() => slidesStore.getSlides())
    .catch((err: unknown) => console.error(err));
}

function onEdit(id: unknown) {
  isEdit.value = true;
  const item = slides.value?.filter((v) => v.id === id);
  slide.value = item?.length ? item[0] : null;
  isShowAddSlide.value = true;
}

onMounted(() => {
  if (!slidesStore.slides) slidesStore.getSlides();
  if (!videosStore.videos) videosStore.getAllVideos();
  if (!photosStore.photos) photosStore.getPhotos();
});
</script>
