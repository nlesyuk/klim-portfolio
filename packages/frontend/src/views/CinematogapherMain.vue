<template>
  <div class="home">
    <Slider />
    <WorksGrid
      v-if="allVideos && allVideos.length"
      :works="allVideos"
    ></WorksGrid>
    <p
      v-else-if="allVideos && allVideos.length === 0"
      class="home__empty-category"
    >
      Don't have any works yet
    </p>
    <Spiner v-else />
  </div>
</template>

<script>
import WorksGrid from "../components/WorksGrid";
import Slider from "./Slider";
import { mapActions, mapState } from "vuex";
import { setTitle } from "@/helper/";

export default {
  name: "Works",
  components: {
    WorksGrid,
    Slider
  },
  computed: {
    ...mapState({
      videos: state => state.videos.videos
    }),
    isMobile() {
      return window.innerWidth < 992;
    },
    allVideos() {
      if (this.$route.name === "works-commercial") {
        if (!this.videos) {
          return;
        }
        return this.videos.filter(video =>
          video?.category?.includes("commerce")
        );
      }
      return this.videos;
    }
  },
  methods: {
    ...mapActions(["getAllVideos"])
  },
  mounted() {
    setTitle("Works");

    if (!this.videos) {
      this.getAllVideos();
    }
  }
};
</script>
