<template>
  <section class="dashboard-add-shot">
    <form class="dashboard__form" @submit.prevent="submit">
      <div class="dashboard__label">
        <span>Please upload shots</span>
        <input type="file" @change="getFiles" ref="filesInput" v-show="selectedImages && !selectedImages.length" />
        <ul class="dashboard__list-imgs">
          <li v-for="(file, idx) in selectedImages" :key="idx">
            <span class="dashboard__badge badge-yellow">{{ idx + 1 }}</span>
            <button type="button" @click="removeSelectedImage(file.url)">delete</button>
            <div v-if="file.workId" class="dashboard__badge badge-green">Linked to post-id: {{ file.workId }}</div>
            <img :src="file.url" alt="preview" />
            <div class="dashboard__select">
              <select v-model="file.workId">
                <option disabled selected value="null">Please linking the Shot to the Work</option>
                <option v-for="(item, i) of videos" :key="i" :value="item.id">{{ item.title }}</option>
              </select>
            </div>
            <h3 class="dashboard__text">Please choose related category(ies):</h3>
            <label class="dashboard__label mb0 dashboard__label--inline" v-for="category in categories" :key="category">
              <input type="checkbox" :value="category" v-model="file.categories" />
              <span>{{ category }}</span>
            </label>
            <label class="dashboard__label mb0">
              <input type="radio" :name="`format${idx}`" value="vertical" v-model="file.format" />
              <span class="inline">vertical</span>
            </label>
            <label class="dashboard__label">
              <input type="radio" :name="`format${idx}`" value="horizontal" v-model="file.format" />
              <span class="inline">horizontal</span>
            </label>
          </li>
        </ul>
      </div>
      <div class="dashboard__btns-container">
        <button type="submit" class="dashboard__submit" :disabled="!isAllowCreateShots">Add shot(s)</button>
        <button type="reset" class="dashboard__submit" :disabled="!isLoading" @click="reset">Reset</button>
        <div class="dashboard__status">
          <div class="dashboard__status--success" v-if="isSuccess">Shot was added</div>
          <div class="dashboard__status--fail" v-if="serverError">Server error: {{ serverError }}</div>
        </div>
        <Spiner v-if="isLoading" :isCenter="false" />
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Spiner from "@/components/Spiner.vue";
import { useShotsStore } from "@/stores/shots";
import { useVideosStore } from "@/stores/videos";
import { getHeightAndWidthFromDataUrl } from "@/helper";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";

const ShotsRepository = RepositoryFactory.get("shots");
const shotsStore = useShotsStore();
const videosStore = useVideosStore();

const filesInput = ref<HTMLInputElement | null>(null);
const isLoading = ref(false);
const isSuccess = ref(false);
const serverError = ref<string | null>(null);
const selectedImages = ref<Record<string, unknown>[]>([]);

const videos = computed(() => videosStore.videos as Record<string, unknown>[] | null);
const categories = computed(() => shotsStore.categories);
const isAllowCreateShots = computed(() => {
  if (!selectedImages.value.length) return false;
  return selectedImages.value.every((file) => file.workId && (file.categories as string[]).length > 0);
});

function getFiles() {
  const files = filesInput.value?.files;
  if (!files) return;
  Array.from(files).forEach((file) => {
    getHeightAndWidthFromDataUrl(file).then((resol) => {
      const format = resol.height > resol.width ? "vertical" : "horizontal";
      selectedImages.value.push({ file, photoOriginalName: file.name, workId: null, categories: ["all"], url: URL.createObjectURL(file), format });
    });
  });
}

function removeSelectedImage(url: unknown) {
  selectedImages.value = selectedImages.value.filter((v) => v.url !== url);
}

function reset() { selectedImages.value = []; }

async function submit() {
  try {
    isLoading.value = true;
    const formData = new FormData();
    for (const item of selectedImages.value) formData.append("photos[]", item.file as File);
    const images = JSON.parse(JSON.stringify(selectedImages.value));
    const shots = Array.from(images).map((v: unknown) => {
      const obj = { ...(v as Record<string, unknown>) };
      delete obj.file;
      delete obj.url;
      return obj;
    });
    formData.append("shots", JSON.stringify(shots));
    await ShotsRepository.create(formData);
    isSuccess.value = true;
    reset();
  } catch (e) {
    console.error(e);
    serverError.value = (e as { response?: { statusText?: string } })?.response?.statusText ?? null;
  } finally {
    isLoading.value = false;
    setTimeout(() => { isSuccess.value = false; }, 20_000);
  }
}

onMounted(() => {
  if (!videosStore.videos) videosStore.getAllVideos();
});
</script>
