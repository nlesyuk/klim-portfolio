<template>
  <figure :class="[classes, 'vimeo']">
    <div class="vimeo__poster" :style="vimeoBackground" @click="playVideo">
      <svg class="vimeo__play" width="40" height="40">
        <use xlink:href="#svg-sprite--play"></use>
      </svg>
    </div>
    <div
      ref="videoEl"
      :class="[
        'vimeoPlayer',
        'video-responsive',
        { 'vimeoPlayer-hidden': !isPlaying },
      ]"
    ></div>
  </figure>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Player from "@vimeo/player";

const props = withDefaults(
  defineProps<{
    id: string | number;
    previewImg?: string;
    classes?: string;
  }>(),
  { previewImg: "https://i.vimeocdn.com/video/73907898_640.jpg" },
);

const videoEl = ref<HTMLElement | null>(null);
const player = ref<InstanceType<typeof Player> | null>(null);
const isPlaying = ref(false);

const vimeoBackground = computed(() =>
  isPlaying.value ? "" : `background-image: url(${props.previewImg});`,
);

function installVimeo() {
  if (!videoEl.value) return;
  player.value = new Player(videoEl.value, {
    id: +props.id || 521769877,
    width: 640,
    color: "#ff0000",
  });
  player.value.on("ended", () => {
    isPlaying.value = false;
  });
}

function playVideo() {
  if (!player.value) installVimeo();
  if (player.value) {
    player.value.play();
    isPlaying.value = true;
  }
}
</script>
