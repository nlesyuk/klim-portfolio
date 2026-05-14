<template>
  <figure :class="[classes, 'slider__slide']" @click="goTo">
    <img v-if="source.type === 'image'" :src="source.image" class="slider__img" loading="lazy" />
    <div
      v-else-if="source.type === 'video'"
      ref="videoEl"
      :class="['vimeoPlayer', { hidden: !isPlaying }]"
      @click="pauseVideo"
    ></div>
  </figure>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import Player from "@vimeo/player";
import type { Slide, WorkVideos } from "@/models";

const props = defineProps<{
  source: Slide;
  classes?: string;
  isHideTitle?: boolean;
  currentSlide: number | string;
  slideId: number | string;
  allSlides: number | string;
}>();

const router = useRouter();
const videoEl = ref<HTMLElement | null>(null);
const player = ref<InstanceType<typeof Player> | null>(null);
const isPaused = ref(false);
const isPlaying = ref(false);

function installVimeo() {
  const v = typeof props.source.videos === "string"
    ? (JSON.parse(props.source.videos) as WorkVideos)
    : props.source.videos;
  const vimeoId = v?.vimeoId;
  if (!vimeoId || props.source.type !== "video" || player.value || !videoEl.value) return;
  player.value = new Player(videoEl.value, { id: +vimeoId, width: 640, color: "#ff0000", background: true, autopause: true, byline: false, loop: true, controls: false, responsive: true });
  player.value.setQuality("720p");
  return player.value.ready();
}

function playVideo() {
  if (!player.value) {
    Promise.resolve(installVimeo()).then(() => { player.value?.play(); isPlaying.value = true; });
    return;
  }
  player.value.setCurrentTime(0).then(() => { player.value?.play(); isPlaying.value = true; });
}

function pauseVideo() {
  if (!player.value) { installVimeo(); return; }
  if (isPaused.value) { player.value?.play(); isPaused.value = false; }
  else { player.value?.pause().then(() => { player.value?.setCurrentTime(0); }); isPaused.value = true; }
}

function goTo() {
  const s = props.source;
  if (Object.prototype.hasOwnProperty.call(s, "photoId") && s.photoId) router.push({ path: `/photo/${s.photoId}` });
  else if (Object.prototype.hasOwnProperty.call(s, "workId") && s.workId) router.push({ path: `/work/${s.workId}` });
}

watch(() => props.currentSlide, (id) => {
  if (props.source.type !== "video") return;
  if (!player.value) { installVimeo(); return; }
  if (id === props.slideId) playVideo(); else pauseVideo();
});

onMounted(() => { if (props.source.type === "video") playVideo(); });
</script>
