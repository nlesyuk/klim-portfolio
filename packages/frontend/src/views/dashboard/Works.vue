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

const qc = useQueryClient();
const { data } = useVideosQuery();
const { mutate: deleteVideo } = useDeleteVideo();

const work = ref<unknown>(null);
const isEdit = ref(false);
const isShowAddWork = ref(false);

const videos = computed(() => data.value);

function refresh() { qc.invalidateQueries({ queryKey: queryKeys.videos() }); }

function onEdit(id: unknown) {
  isEdit.value = true;
  const item = (data.value as Record<string, unknown>[] | undefined)?.filter((v) => v.id === id);
  work.value = item?.length ? item[0] : null;
  isShowAddWork.value = true;
}

function onDelete(id: unknown) { deleteVideo(id); }
</script>
