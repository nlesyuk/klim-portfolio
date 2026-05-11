<template>
  <figure :class="[classes, 'vimeo']">
    <div class="vimeo__poster" :style="vimeoBackground" @click="playVideo">
      <svg class="vimeo__play" width="40" height="40">
        <use xlink:href="#svg-sprite--play"></use>
      </svg>
    </div>

    <div
      ref="video"
      :class="[
        'vimeoPlayer',
        'video-responsive',
        { 'vimeoPlayer-hidden': !isPlaying }
      ]"
    ></div>
  </figure>
</template>
<script>
import Player from "@vimeo/player";

export default {
  props: {
    id: {
      type: [String, Number],
      required: true
    },
    previewImg: {
      type: String,
      default: "https://i.vimeocdn.com/video/73907898_640.jpg"
    },
    classes: {
      type: String
    }
  },
  data() {
    return {
      player: null,
      isPlaying: false
    };
  },
  computed: {
    vimeoBackground() {
      return this.isPlaying ? "" : `background-image: url(${this.previewImg});`;
    }
  },
  methods: {
    installVimeo(id) {
      this.player = new Player(this.$refs.video, {
        id: +id || 521769877,
        width: 640,
        color: "#ff0000"
      });
      this.player.on("ended", () => {
        this.isPlaying = false;
      });
    },
    playVideo() {
      if (!this.player) this.installVimeo(this.id);
      if (this.player) {
        this.player.play();
        this.isPlaying = true;
      }
    }
  }
};
</script>
