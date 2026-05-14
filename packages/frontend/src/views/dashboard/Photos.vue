<template>
  <section class="dashboard-photos">
    <button type="button" @click="isShowAddPhoto = !isShowAddPhoto" class="dashboard__btn">Add photo</button>
    <PhotoAdd v-if="isShowAddPhoto" :isEdit="isEdit" :photoCollection="photoCollection" />
    <button type="button" @click="refresh" class="dashboard__btn">Refresh photos</button>

    <label v-if="isPhotographerMode" class="dashboard__checkbox">
      <input type="checkbox" v-model="personal" />
      Personal({{ personal ? "on" : "off" }})
    </label>

    <div class="dashboard-photos__container" v-if="!isPhotosEmpty">
      <PhotoPreview
        v-for="(item, idx) in photos"
        :key="idx"
        :collection="item"
        :collectionType="idx % 2 ? 'left' : 'right'"
      >
        <ul class="dashboard__list" v-if="isManage">
          <li><button type="button" class="dashboard__btn-inline" title="order" disabled>{{ item.order }}</button></li>
          <li><button type="button" class="dashboard__btn-inline" @click.prevent="remove(item.id)">Remove</button></li>
          <li><button type="button" class="dashboard__btn-inline" @click.prevent="edit(item.id)">Edit</button></li>
          <li><button type="button" class="dashboard__btn-inline" title="id" disabled>id:{{ item.id }}</button></li>
          <li>
            <span class="dashboard__badge badge-blue" v-for="(category, index) in item.category" :key="index">{{ category }}</span>
          </li>
          <li class="dashboard__badge badge-green color-black">{{ getCategories(item.categories) }}</li>
        </ul>
      </PhotoPreview>
    </div>
    <div v-else-if="isPhotosEmpty" class="grid-empty">Don't have any items yet</div>
    <Spiner v-else />
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useQueryClient } from "@tanstack/vue-query";
import PhotoAdd from "./PhotoAdd.vue";
import PhotoPreview from "@/components/PhotoPreview.vue";
import Spiner from "@/components/Spiner.vue";
import { usePhotosQuery, useDeletePhoto } from "@/composables/usePhotos";
import { queryKeys } from "@/queries/keys";
import { isCinematographerMode, isPhotographerMode } from "@/helper/constants";

const route = useRoute();
const qc = useQueryClient();
const { data } = usePhotosQuery();
const { mutate: deletePhoto } = useDeletePhoto();

const isEdit = ref(false);
const isManage = ref(true);
const isShowAddPhoto = ref(false);
const photoCollection = ref<unknown>(null);
const personal = ref(false);

const allPhotos = computed(() => data.value as Record<string, unknown>[] | undefined);

const photographerPhotos = computed(() => {
  if (personal.value) return allPhotos.value?.filter((v) => (v.categories as string[]).includes("personal"));
  return allPhotos.value;
});

const cinematographerPhotos = computed(() => {
  const p = allPhotos.value;
  if (!p) return undefined;
  const sorted = route.path.includes("commerce")
    ? p.filter((v) => (v.categories as string[]).includes("commerce"))
    : p;
  return [...sorted].sort((a, b) => (b.order as number) - (a.order as number));
});

const photos = computed(() => isCinematographerMode ? cinematographerPhotos.value : photographerPhotos.value);
const isPhotosEmpty = computed(() => !photos.value?.length);

function remove(id: unknown) { deletePhoto(id); }
function refresh() { qc.invalidateQueries({ queryKey: queryKeys.photos() }); }
function getCategories(arr: unknown) {
  if (Array.isArray(arr)) return arr.join(", ");
  return arr;
}
function edit(id: unknown) {
  isEdit.value = true;
  const item = allPhotos.value?.filter((v) => v.id === id);
  photoCollection.value = item?.length ? item[0] : null;
  isShowAddPhoto.value = true;
}
</script>

<style></style>
