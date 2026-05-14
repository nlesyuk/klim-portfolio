<template>
  <div>
    <ul class="dashboard__list-imgs" v-if="shot">
      <li>
        <span class="dashboard__badge badge-yellow">id: {{ shot.id }}</span>
        <div v-if="shot.workId" class="dashboard__badge badge-green">
          Linked to post-id: {{ shot.workId }}
        </div>

        <button type="button" v-if="shot.src" @click="removeImage">delete</button>

        <img v-if="shot.src" :src="shot.src" alt="preview" />
        <div v-else>
          <span>Please upload shots</span>
          <input type="file" @change="getFiles" ref="fileInput" />
        </div>

        <div class="dashboard__select">
          <select v-model="shot.workId">
            <option disabled selected value="null">Please linking the Shot to the Work</option>
            <option v-for="(item, idx) of videos" :key="idx" :value="item.id">
              {{ item.title }}
            </option>
          </select>
        </div>

        <p class="dashboard__text">Please choose category for this shot:</p>
        <label
          class="dashboard__label mb0"
          v-for="(category, idx) of myCategories"
          :key="idx"
        >
          <input
            type="checkbox"
            v-model="shot.categories"
            :value="category.name"
            :disabled="category.isDisabled"
          />
          <span class="inline">{{ category.name }}</span>
        </label>

        <label class="dashboard__label mb0">
          <input type="radio" name="format" value="vertical" v-model="shot.format" />
          <span class="inline">vertical</span>
        </label>
        <label class="dashboard__label">
          <input type="radio" name="format" value="horizontal" v-model="shot.format" />
          <span class="inline">horizontal</span>
        </label>

        <button type="button" @click="update" class="dashboard__submit" :disabled="isLoading">
          Update shot
        </button>
        <button type="button" @click="emit('close')" class="dashboard__submit" :disabled="isLoading">
          Close
        </button>
        <Spiner v-if="isLoading" :isCenter="false" />
      </li>
    </ul>
    <p v-else class="dashboard__badge badge-red">Something went wrong</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { getHeightAndWidthFromDataUrl } from "@/helper/index";
import { useUpdateShot, shotCategories } from "@/composables/useShots";
import Spiner from "@/components/Spiner.vue";
import type { Shot, Work } from "@/models";

const { mutateAsync: updateShot } = useUpdateShot();

const props = defineProps<{ shot: Shot | undefined; videos: Work[] | undefined }>();
const emit = defineEmits<{ close: [] }>();

const isLoading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const myCategories = computed(() => {
  const cats = shotCategories;
  const shotCats = props.shot?.categories ?? [];
  if (shotCats.includes("all") && shotCats.length !== 1) {
    return cats.map((name) => ({ name, isDisabled: name !== "all" }));
  }
  return cats.map((name) => ({ name, isDisabled: false }));
});

function removeImage() {
  if (props.shot) props.shot.src = "";
}

function getFiles() {
  const files = fileInput.value?.files;
  if (!files || !props.shot) return;
  const shot = props.shot;
  Array.from(files).forEach((file) => {
    getHeightAndWidthFromDataUrl(file).then((res) => {
      shot.format = res.height > res.width ? "vertical" : "horizontal";
      shot.src = URL.createObjectURL(file);
      shot.file = file;
    });
  });
}

async function update() {
  if (!props.shot) return;
  isLoading.value = true;
  const { id, src, workId, categories, format, file } = props.shot;
  const cats = categories;
  const submitCategories = cats.some((v) => v === "all")
    ? ["all"]
    : cats.filter((v) => v !== "all");

  try {
    const formData = new FormData();
    formData.append("id", String(id));
    formData.append("format", String(format));
    formData.append("workId", String(workId));
    formData.append("categories", JSON.stringify(submitCategories));
    if (file) {
      formData.append("photos[]", file as File);
    } else {
      formData.append("src", String(src));
    }
    await updateShot(formData);
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
}
</script>
