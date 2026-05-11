<template>
  <figure :class="[classes, 'slider__slide']" @click="goTo">
    <!-- img -->
    <img
      v-if="source.type === 'image'"
      :src="source.image"
      class="slider__img"
      loading="lazy"
    />
    <!-- video -->
    <div
      v-else-if="source.type === 'video'"
      ref="video"
      :class="['vimeoPlayer', { hidden: !isPlaying }]"
      @click="pauseVideo"
    ></div>
    <button
      v-if="false"
      type="button"
      @click="goTo"
      class="slider__slide-btn"
      title="click on me"
    >
      more
    </button>
  </figure>
</template>

<script>
import Player from "@vimeo/player";

export default {
  props: {
    source: {
      type: Object,
      required: true
    },
    classes: {
      type: String
    },
    isHideTitle: {
      type: Boolean,
      default: false
    },
    currentSlide: {
      type: [Number, String],
      required: true
    },
    slideId: {
      type: [Number, String],
      required: true
    },
    allSlides: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      player: null,
      isPaused: false,
      isPlaying: false
    };
  },
  watch: {
    currentSlide(id) {
      if (this.source.type !== "video") {
        return;
      }
      this.launchVideo(id, this.slideId);
    }
  },
  methods: {
    installVimeo() {
      if (
        !this.source?.video?.vimeoId ||
        this.source.type !== "video" ||
        this.player
      ) {
        return;
      }

      this.player = new Player(this.$refs.video, {
        id: this.source.video.vimeoId,
        width: 640,
        color: "#ff0000",
        background: true,
        autopause: true,
        byline: false,
        loop: true,
        controls: false,
        responsive: true
      });
      this.player.setQuality("720p").then();

      return this.player.ready();
    },
    playVideo() {
      if (!this.player) {
        Promise.resolve(this.installVimeo()).then(() => {
          this.player?.play();
          this.isPlaying = true;
        });
        return;
      }

      if (this.player) {
        // eslint-disable-next-line
        this.player.setCurrentTime(0).then(time => {
          this.player.play();
          this.isPlaying = true;
        });
      }
    },
    pauseVideo() {
      if (!this.player) this.installVimeo();

      if (this.isPaused) {
        this.player?.play();
        this.isPaused = false;
      } else {
        this.player?.pause().then(() => {
          this.player.setCurrentTime(0);
        });
        this.isPaused = true;
      }
    },
    launchVideo(currentSlideId, slideId) {
      if (currentSlideId < 0) {
        // when prev slide id(idx) as -1 - get id(idx) of last slide
        // currentSlideId = this.allSlides - 1;
      }

      if (!this.player) {
        this.installVimeo();
        return;
      }

      if (this.player && currentSlideId === slideId) {
        this.playVideo();
      } else {
        this.pauseVideo();
      }
    },

    //
    goTo() {
      if (this.source?.hasOwnProperty("photoId") && this.source?.photoId) {
        this.$router.push({ path: `/photo/${this.source.photoId}` });
      } else if (this.source?.hasOwnProperty("workId") && this.source?.workId) {
        this.$router.push({ path: `/work/${this.source.workId}` });
      }
    }
  },
  mounted() {
    if (this.source.type === "video") {
      this.playVideo();
    }
  }
};
</script>
