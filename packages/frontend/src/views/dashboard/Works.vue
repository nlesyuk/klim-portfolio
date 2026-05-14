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
import { ref, computed } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import WorkAdd from "./WorkAdd.vue";
import WorksGrid from "@/components/WorksGrid.vue";
import Spiner from "@/components/Spiner.vue";
import { useVideosQuery, useDeleteVideo } from "@/composables/useVideos";
import { queryKeys } from "@/queries/keys";
import type { Work } from "@/models";

const qc = useQueryClient();
const { data } = useVideosQuery();
const { mutate: deleteVideo } = useDeleteVideo();

const work = ref<Work | undefined>(undefined);
const isEdit = ref(false);
const isShowAddWork = ref(false);

const videos = computed(() => data.value);

function refresh() { qc.invalidateQueries({ queryKey: queryKeys.videos() }); }

function onEdit(id: number) {
  isEdit.value = true;
  const item = data.value?.filter((v) => v.id === id);
  work.value = item?.length ? item[0] : undefined;
  isShowAddWork.value = true;
}

function onDelete(id: number) { deleteVideo(id); }
</script>
