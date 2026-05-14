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
import { useQuery } from "@tanstack/vue-query";
import PhotosGrid from "@/components/PhotosGrid.vue";
import VimeoVideoPlayer from "@/components/VimeoVideoPlayer.vue";
import Spiner from "@/components/Spiner.vue";
import Error from "@/views/Error.vue";
import { queryKeys } from "@/queries/keys";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";
import { setTitle, handlerServerErrors } from "@/helper/index";

const VideosRepo = RepositoryFactory.get("videos");
const route = useRoute();

const props = withDefaults(defineProps<{ previewWork?: Record<string, unknown>; isPreview?: boolean }>(), { isPreview: false });

const work = ref<Record<string, unknown> | null>(null);
const error = ref<{ status: number; statusText: string } | null>(null);

const videoId = computed(() => route.params.id);

const { data: fetchedWork, isPending, error: queryError } = useQuery<Record<string, unknown>>({
  queryKey: computed(() => [...queryKeys.videos(), videoId.value]),
  queryFn: () => VideosRepo.getVideo(videoId.value).then((r: { data: Record<string, unknown> }) => r.data),
  enabled: computed(() => !props.isPreview && !!videoId.value),
});

const isLoading = computed(() => !props.isPreview && isPending.value);

watch(fetchedWork, (v) => { if (v) work.value = v; });
watch(queryError, (e) => { if (e) error.value = handlerServerErrors(e); });

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

onMounted(() => {
  setTitle("Work");
  if (props.isPreview) {
    work.value = props.previewWork ?? null;
  }
});
</script>
