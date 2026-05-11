<template>
  <div class="home">
    <template v-if="allPhotos && allPhotos.length">
      <PhotoPreview
        v-for="(photo, idx) in allPhotos"
        :key="idx"
        :collection="photo"
        :collectionType="idx % 2 ? 'left' : 'right'"
      />
    </template>
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
import PhotoPreview from "../components/PhotoPreview";
import { mapActions, mapState } from "vuex";
import { setTitle } from "@/helper";

export default {
  components: {
    PhotoPreview
  },
  computed: {
    ...mapState({
      photos: state => state.photos.photos
    }),
    allPhotos() {
      const category = this.$route?.query?.filter;
      if (category === "all" || !category) {
        return this.photos;
      }

      const filtered = this.photos?.filter(item =>
        item?.categories?.includes(category)
      );

      return filtered || this.photos;
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
