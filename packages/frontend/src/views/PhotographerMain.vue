<template>
  <div class="home">
    <Slider />
    <PhotosPreviewGrid
      v-if="allPhotos && allPhotos.length"
      :photos="allPhotos"
    ></PhotosPreviewGrid>
    <p
      v-else-if="allPhotos && allPhotos.length === 0"
      class="home__empty-category"
    >
      Don't have any photo collections yet
    </p>
    <Spiner v-else />
  </div>
</template>

<script>
import PhotosPreviewGrid from "../components/PhotosPreviewGrid";
import Slider from "./Slider";
import { mapActions, mapState } from "vuex";
import { setTitle } from "@/helper";

export default {
  components: {
    PhotosPreviewGrid,
    Slider
  },
  computed: {
    ...mapState({
      photos: state => state.photos.photos
    }),
    allPhotos() {
      const category = this.$route?.query?.filter;

      const filtered = {
        all: this.photos,
        automotive: this.photos?.filter(item =>
          item?.categories?.includes("automotive")
        ),
        fashion: this.photos?.filter(item =>
          item?.categories?.includes("fashion")
        ),
        lifestyle: this.photos?.filter(item =>
          item?.categories?.includes("lifestyle")
        ),
        personal: this.photos?.filter(item =>
          item?.categories?.includes("personal")
        )
      };

      return filtered[category] || this.photos;
    }
  },
  methods: {
    ...mapActions(["getPhotos"])
  },
  mounted() {
    setTitle("Portfolio");

    if (!this.photos) {
      this.getPhotos();
    }
  }
};
</script>
