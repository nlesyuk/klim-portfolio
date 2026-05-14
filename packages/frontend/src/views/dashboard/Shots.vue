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
import { ref, computed } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import ShotAdd from "./ShotAdd.vue";
import ShotEdit from "./ShotEdit.vue";
import PhotosGridShots from "@/components/PhotosGridShots.vue";
import Spiner from "@/components/Spiner.vue";
import { useShotsQuery, useDeleteShot } from "@/composables/useShots";
import { useVideosQuery } from "@/composables/useVideos";
import { queryKeys } from "@/queries/keys";

const qc = useQueryClient();
const { data: shotsData } = useShotsQuery();
const { data: videosData } = useVideosQuery();
const { mutate: deleteShot, isPending: isDeleting } = useDeleteShot();

const isEdit = ref(false);
const editedShot = ref<unknown>(null);
const isShowAddShot = ref(false);

const videos = computed(() => videosData.value);
const isLoading = computed(() => isDeleting.value);
const sortedFilteredPhotos = computed(() => {
  const shots = (shotsData.value ?? []) as Record<string, unknown>[];
  return [...shots].sort((a, b) => (b.id as number) - (a.id as number));
});

function refresh() { qc.invalidateQueries({ queryKey: queryKeys.shots() }); }

function remove(id: unknown) { deleteShot(id); }

function edit(id: unknown) {
  window.scroll({ top: 0, left: 0, behavior: "smooth" });
  isEdit.value = true;
  const shots = (shotsData.value ?? []) as Record<string, unknown>[];
  const found = shots.filter((v) => v.id === id);
  editedShot.value = found?.length ? found[0] : null;
}

function closeEdit() { isEdit.value = false; }
</script>
