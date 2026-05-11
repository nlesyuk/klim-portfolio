<template>
  <hooper
    :settings="hooperSettings"
    style="height: auto; margin-bottom: 20px;"
    @slide="onSlideChange"
  >
    <slide v-for="(slide, idx) in sortedSlides" :key="idx" :index="idx">
      <SlideComponent
        :source="slide"
        :slideId="idx"
        :currentSlide="currentSlide"
        :allSlides="sortedSlides.length"
      />
    </slide>
    <hooper-navigation slot="hooper-addons"></hooper-navigation>
    <hooper-pagination slot="hooper-addons"></hooper-pagination>
  </hooper>
</template>

<script>
import { mapActions, mapState } from "vuex";
import SlideComponent from "../components/Slide";

import {
  Hooper,
  Slide,
  Pagination as HooperPagination,
  Navigation as HooperNavigation
} from "hooper";
import "hooper/dist/hooper.css";

export default {
  components: {
    SlideComponent,
    Hooper,
    Slide,
    HooperPagination,
    HooperNavigation
  },
  data() {
    return {
      currentSlide: 0,
      hooperSettings: {
        autoPlay: true,
        itemsToShow: 1,
        playSpeed: 5 * 1000,
        centerMode: true,
        hoverPause: true,
        wheelControl: false,
        infiniteScroll: true
      }
    };
  },
  computed: {
    ...mapState({
      allSlides: state => state.slides.slides
    }),
    sortedSlides() {
      const slides = this.allSlides;
      if (slides) {
        const sorted = slides.sort((a, b) => b.order - a.order); // new add to the begin
        // const sorted = slides.sort((a, b) => a.order - b.order); // new add to the end
        return sorted;
      }
      return slides;
    }
  },
  methods: {
    ...mapActions(["getSlides"]),
    onSlideChange(object) {
      this.currentSlide = object.currentSlide;
    }
  },
  mounted() {
    // api
    if (!this.allSlides) {
      this.getSlides().then(() => {
        this.currentSlide = 1;
      });
    }
  }
};
</script>
