<template>
  <div class="photos">
    <template v-if="photos && photos.length">
      <PhotoPreview
        v-for="(photo, idx) in photos"
        :key="idx"
        :collection="photo"
        :collectionType="idx % 2 ? 'left' : 'right'"
      />
    </template>
    <p v-else-if="photos && photos.length === 0" class="home__empty-category">
      Don't have any photos yet
    </p>
    <Spiner v-else />
  </div>
</template>
<script>
import PhotoPreview from "../components/PhotoPreview";
import { mapActions, mapState, mapGetters } from "vuex";
import { isCinematographerMode } from "@/helper/constants";
import { setTitle } from "@/helper";

export default {
  components: {
    PhotoPreview
  },
  computed: {
    ...mapState({
      allPhotos: state => state.photos.photos
    }),
    ...mapGetters(["photographerPhotos", "cinematographerPhotos"]),
    photos() {
      const photos = isCinematographerMode
        ? this.cinematographerPhotos
        : this.photographerPhotos;

      if (!photos?.length) {
        return [];
      }

      const sorted = photos.sort((a, b) => b.order - a.order); // new add to the begin
      // return photos.sort((a, b) => a.order - b.order); // new add to the end

      if (this.$route.name === "commerce") {
        return sorted.filter(item => item.categories?.includes("commerce"));
      }

      return sorted;
    }
  },
  methods: {
    ...mapActions(["getPhotos"])
  },
  created() {
    if (!this.allPhotos) {
      this.getPhotos();
    }
  },
  mounted() {
    setTitle("Photos");
  }
};
</script>
