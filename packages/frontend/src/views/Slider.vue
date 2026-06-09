<template>
  <swiper
    :modules="modules"
    :slides-per-view="1"
    :loop="true"
    :centered-slides="true"
    :autoplay="{
      delay: 5000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    }"
    :pagination="{ clickable: true }"
    :navigation="true"
    style="margin-bottom: 20px"
    @slide-change="onSlideChange"
  >
    <swiper-slide v-for="(slide, idx) in sortedSlides" :key="idx">
      <SlideComponent
        :source="slide"
        :slide-id="idx"
        :current-slide="currentSlide"
        :all-slides="sortedSlides.length"
      />
    </swiper-slide>
  </swiper>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import SlideComponent from "@/components/Slide.vue";
import { useSlidesQuery } from "@/composables/useSlides";

const { data } = useSlidesQuery();
const currentSlide = ref(0);
const modules = [Navigation, Pagination, Autoplay];

const sortedSlides = computed(() => {
  const slides = data.value;
  if (!slides) return [];
  return [...slides].sort((a, b) => b.order - a.order);
});

function onSlideChange(swiper: SwiperClass) {
  currentSlide.value = swiper.activeIndex;
}
</script>
