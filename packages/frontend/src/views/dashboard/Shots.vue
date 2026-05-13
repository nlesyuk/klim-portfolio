<template>
  <section class="dashboard-shots">
    <button type="button" class="dashboard__btn" @click="isShowAddShot = !isShowAddShot">Add shot</button>
    <ShotAdd v-if="isShowAddShot" />
    <ShotEdit v-if="isEdit" :shot="editedShot" :videos="videos" @close="closeEdit" />
    <button type="button" @click="refresh" class="dashboard__btn">Refresh shots</button>
    <PhotosGridShots
      v-if="sortedFilteredPhotos"
      :images="sortedFilteredPhotos"
      :isManage="true"
      @removeImg="remove"
      @editImg="edit"
    />
    <Spiner v-else />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import ShotAdd from "./ShotAdd.vue";
import ShotEdit from "./ShotEdit.vue";
import PhotosGridShots from "@/components/PhotosGridShots.vue";
import Spiner from "@/components/Spiner.vue";
import { useShotsStore } from "@/stores/shots";
import { useVideosStore } from "@/stores/videos";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";

const ShotRepository = RepositoryFactory.get("shots");
const shotsStore = useShotsStore();
const videosStore = useVideosStore();

const isLoading = ref(false);
const isEdit = ref(false);
const editedShot = ref<unknown>(null);
const isShowAddShot = ref(false);
const filteredPhotos = ref<unknown[]>([]);

const videos = computed(() => videosStore.videos);
const sortedFilteredPhotos = computed(() =>
  [...filteredPhotos.value].sort((a, b) => (b as Record<string, unknown>).id as number - ((a as Record<string, unknown>).id as number))
);

function refresh() { shotsStore.getAllShots(); }

async function remove(id: unknown) {
  try {
    isLoading.value = true;
    filteredPhotos.value = filteredPhotos.value.filter((v) => (v as Record<string, unknown>).id !== id);
    await ShotRepository.delete(id);
  } catch (e) {
    console.error("REMOVE ERROR", e);
  } finally {
    isLoading.value = false;
  }
}

function edit(id: unknown) {
  window.scroll({ top: 0, left: 0, behavior: "smooth" });
  isEdit.value = true;
  const found = filteredPhotos.value.filter((v) => (v as Record<string, unknown>).id === id);
  editedShot.value = found?.length ? found[0] : null;
}

function closeEdit() { isEdit.value = false; }

onMounted(async () => {
  try {
    const shots = shotsStore.shots as unknown[];
    if (!shots.length) {
      const data = await shotsStore.getAllShots();
      filteredPhotos.value = data ?? [];
    }
    filteredPhotos.value = shotsStore.shots as unknown[];
    if (!videosStore.videos) videosStore.getAllVideos();
  } catch (err) {
    console.error(err);
  }
});
</script>
