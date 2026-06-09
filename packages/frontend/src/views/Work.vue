<template>
  <div class="work-page">
    <Spiner v-if="isLoading" />
    <template v-if="work">
      <VimeoVideoPlayer
        :id="work.videos?.vimeoId ?? ''"
        :preview-img="previewImg ?? undefined"
      />
      <h1 class="work-page__title">{{ work.title }}</h1>
      <p class="work-page__description" v-html="work.description"></p>
      <PhotosGrid
        v-show="work.photos"
        :images="work.photos ?? []"
        :is-works="isPreview"
      />
      <p class="work-page__credits" v-html="work.credits"></p>
    </template>
    <h2 v-else-if="!error && !work && !isLoading" class="something-went-wrong">
      Something went wrong :()
    </h2>
    <Error
      v-if="error"
      :status-code="error.status"
      :message="error.statusText"
    />
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
import type { Work } from "@/models";

const VideosRepo = RepositoryFactory.get("videos");
const route = useRoute();

const props = withDefaults(
  defineProps<{ previewWork?: Partial<Work>; isPreview?: boolean }>(),
  { isPreview: false },
);

const work = ref<Partial<Work> | undefined>(undefined);
const error = ref<{ status: number; statusText: string } | null>(null);

const videoId = computed(() => route.params.id);

const {
  data: fetchedWork,
  isPending,
  error: queryError,
} = useQuery<Work>({
  queryKey: computed(() => [...queryKeys.videos(), videoId.value]),
  queryFn: () => VideosRepo.getVideo(videoId.value).then((r) => r.data),
  enabled: computed(() => !props.isPreview && !!videoId.value),
});

const isLoading = computed(() => !props.isPreview && isPending.value);

watch(fetchedWork, (v) => {
  if (v) work.value = v;
});
watch(queryError, (e) => {
  if (e) error.value = handlerServerErrors(e);
});

const previewImg = computed(() => {
  if (!work.value) return null;
  const previews = work.value.photos?.filter((img) => img.isPreview) ?? [];
  if (props.isPreview) return previews.length ? previews[0].src : "";
  return previews.length ? previews[0].src : null;
});

watch(
  () => props.previewWork,
  (v) => {
    if (v) work.value = v;
  },
);

onMounted(() => {
  setTitle("Work");
  if (props.isPreview) {
    work.value = props.previewWork;
  }
});
</script>
