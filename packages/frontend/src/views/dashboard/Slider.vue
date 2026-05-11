<template>
  <section class="dashboard-slider">
    <button class="dashboard__btn" @click="isShowAddSlide = !isShowAddSlide">
      Add slide
    </button>

    <SlideAdd
      v-if="isShowAddSlide"
      :isEdit="isEdit"
      :slide="slide"
      :slides="slides"
      :works="videos"
      :photos="photos"
    ></SlideAdd>

    <button type="button" @click="onRefresh" class="dashboard__btn">
      Refresh slides
    </button>

    <Slides
      v-if="sortedSlides && sortedSlides.length"
      :slides="sortedSlides"
      @delete="onDelete"
      @edit="onEdit"
    ></Slides>
    <div
      v-else-if="sortedSlides && sortedSlides.length === 0"
      class="grid-empty"
    >
      Don't have any items yet
    </div>

    <Spiner v-else />
  </section>
</template>

<script>
import SlideAdd from "./SlideAdd.vue";
import Slides from "../../components/Slides.vue";
import { mapState, mapActions } from "vuex";
import { RepositoryFactory } from "Repositories/RepositoryFactory.ts";
const SlidesRepository = RepositoryFactory.get("slides");

export default {
  components: {
    Slides,
    SlideAdd
  },
  data() {
    return {
      slide: null,
      isEdit: false,
      isShowAddSlide: false
    };
  },
  computed: {
    ...mapState({
      slides: state => state.slides.slides,
      videos: state => state.videos.videos,
      photos: state => state.photos.photos
    }),
    sortedSlides() {
      const slides = this.slides;
      if (slides) {
        const sorted = slides.sort((a, b) => b.order - a.order); // new add to the begin
        // const sorted = slides.sort((a, b) => a.order - b.order); // new add to the end
        return sorted;
      }
      return slides;
    }
  },
  methods: {
    ...mapActions(["getSlides", "getAllVideos", "getPhotos"]),
    getPreviewImg(item) {
      const filtered = item.photos.filter(v => v.isVideoPreview);
      return filtered && filtered.length ? filtered[0].src : false;
    },
    onDelete(id) {
      SlidesRepository.delete(id)
        .then(() => {
          this.getSlides(); // not good, TODO: remove item from store with mutation
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.error(err);
        });
    },
    onRefresh() {
      this.getSlides();
    },

    // edit
    onEdit(id) {
      this.isEdit = true;
      const item = this.slides?.filter(v => v.id === id);
      this.slide = item?.length ? item[0] : null;
      this.isShowAddSlide = true; // we use the AddSlide form for edit a work
    }
  },
  created() {
    if (!this.slides) {
      this.getSlides();
    }
    if (!this.videos) {
      this.getAllVideos();
    }
    if (!this.photos) {
      this.getPhotos();
    }
  }
};
</script>
