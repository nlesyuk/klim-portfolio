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
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import PhotoAdd from "./PhotoAdd.vue";
import PhotoPreview from "@/components/PhotoPreview.vue";
import Spiner from "@/components/Spiner.vue";
import { usePhotosStore } from "@/stores/photos";
import { isCinematographerMode, isPhotographerMode } from "@/helper/constants";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";

const PhotosRepository = RepositoryFactory.get("photos");
const photosStore = usePhotosStore();
const route = useRoute();

const isEdit = ref(false);
const isManage = ref(true);
const isShowAddPhoto = ref(false);
const photoCollection = ref<unknown>(null);
const personal = ref(false);

const allPhotos = computed(() => photosStore.photos as Record<string, unknown>[] | null);

const photographerPhotos = computed(() => {
  if (personal.value) return allPhotos.value?.filter((v) => (v.categories as string[]).includes("personal"));
  return allPhotos.value;
});

const cinematographerPhotos = computed(() => {
  const p = allPhotos.value;
  if (!p) return null;
  const sorted = route.path.includes("commerce")
    ? p.filter((v) => (v.categories as string[]).includes("commerce"))
    : p;
  return [...sorted].sort((a, b) => (b.order as number) - (a.order as number));
});

const photos = computed(() => isCinematographerMode ? cinematographerPhotos.value : photographerPhotos.value);
const isPhotosEmpty = computed(() => !photos.value?.length);

function remove(id: unknown) { PhotosRepository.delete(id); }
function refresh() { photosStore.getPhotos(); }
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

onMounted(() => {
  if (!allPhotos.value) photosStore.getPhotos();
});
</script>

<style></style>
