<template>
  <div class="work-page">
    <Spiner v-if="isLoading" />
    <template v-if="work">
      <VimeoVideoPlayer :id="work.videos.vimeoId" :previewImg="previewImg" />
      <h1 class="work-page__title">{{ work.title }}</h1>
      <p class="work-page__description" v-html="work.description"></p>
      <PhotosGrid v-show="work.photos" :images="work.photos" :isWorks="isPreview" />
      <p class="work-page__credits" v-html="work.credits"></p>
    </template>
    <h2 v-else-if="!error && !work && !isLoading" class="something-went-wrong">
      Something went wrong :()
    </h2>
    <Error v-if="error" :statusCode="error.status" :message="error.statusText" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import PhotosGrid from "@/components/PhotosGrid.vue";
import VimeoVideoPlayer from "@/components/VimeoVideoPlayer.vue";
import Spiner from "@/components/Spiner.vue";
import Error from "@/views/Error.vue";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";
import { setTitle, handlerServerErrors } from "@/helper/index";

const VideosRepository = RepositoryFactory.get("videos");
const route = useRoute();

const props = withDefaults(defineProps<{ previewWork?: Record<string, unknown>; isPreview?: boolean }>(), { isPreview: false });

const work = ref<Record<string, unknown> | null>(null);
const error = ref<{ status: number; statusText: string } | null>(null);
const isLoading = ref(false);

const previewImg = computed(() => {
  if (!work.value) return null;
  if (props.isPreview) {
    const res = (work.value.photos as Record<string, unknown>[] | undefined)?.filter((img) => img.isPreview) ?? [];
    return res.length ? res[0].src : "";
  }
  const res = (work.value.photos as Record<string, unknown>[]).filter((img) => img.isPreview);
  return res.length ? res[0].src : null;
});

watch(() => props.previewWork, (v) => { if (v) work.value = v; });

onMounted(async () => {
  setTitle("Work");
  if (props.isPreview) {
    work.value = props.previewWork ?? null;
    return;
  }
  try {
    isLoading.value = true;
    const { data } = await VideosRepository.getVideo(route.params.id);
    work.value = data;
  } catch (e) {
    console.error(e);
    error.value = handlerServerErrors(e);
  } finally {
    isLoading.value = false;
  }
});
</script>
