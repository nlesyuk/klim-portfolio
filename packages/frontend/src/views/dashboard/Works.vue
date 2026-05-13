<template>
  <section class="dashboard-works">
    <button class="dashboard__btn" @click="isShowAddWork = !isShowAddWork">Add work</button>
    <WorkAdd
      v-if="isShowAddWork"
      :work="work"
      :works="videos"
      :isEdit="isEdit"
      @resetForm="isEdit = false"
      @work-create-successfully="refresh"
    />
    <button type="button" @click="refresh" class="dashboard__btn">Refresh works</button>
    <WorksGrid
      v-if="videos && videos.length"
      :works="videos"
      :isAdmin="true"
      @delete="onDelete"
      @edit="onEdit"
    />
    <div v-else-if="videos && videos.length === 0" class="grid-empty">Don't have any items yet</div>
    <Spiner v-else />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import WorkAdd from "./WorkAdd.vue";
import WorksGrid from "@/components/WorksGrid.vue";
import Spiner from "@/components/Spiner.vue";
import { useVideosStore } from "@/stores/videos";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";

const VideosRepository = RepositoryFactory.get("videos");
const videosStore = useVideosStore();

const work = ref<unknown>(null);
const isEdit = ref(false);
const isShowAddWork = ref(false);

const videos = computed(() => videosStore.videos);

function refresh() { videosStore.getAllVideos(); }

function onEdit(id: unknown) {
  isEdit.value = true;
  const item = (videosStore.videos as Record<string, unknown>[] | null)?.filter((v) => v.id === id);
  work.value = item?.length ? item[0] : null;
  isShowAddWork.value = true;
}

function onDelete(id: unknown) { VideosRepository.delete(id); }

onMounted(() => {
  if (!videosStore.videos) videosStore.getAllVideos();
});
</script>
