<template>
  <section class="dashboard-works-add">
    <form class="dashboard__form dashboard__form--preview" @submit.prevent="submit">
      <div class="dashboard__side">
        <!-- id -->
        <label v-if="slide" class="dashboard__label">
          <span>Slide id: {{ slide.id }}</span>
        </label>

        <!-- Title -->
        <label
          :class="[
            'dashboard__label',
            { 'dashboard__label-error': v$.title.$dirty && v$.title.$error }
          ]"
        >
          <span>Title</span>
          <input type="text" v-model="slideFields.title" />
          <strong class="dashboard__label-error-info" v-if="v$.title.$dirty && v$.title.$error">
            Min length is 2
          </strong>
        </label>

        <!-- Order -->
        <label class="dashboard__label">
          <span>Order</span>
          <select v-model="slideFields.order">
            <option disabled selected value="null">Please choose order</option>
            <option v-for="(item, index) of slidersLength" :key="index" :value="index">
              {{ index }}
            </option>
          </select>
        </label>

        <!-- Work -->
        <label class="dashboard__label">
          <span>Link slide to work <b v-if="slideFields.workId === ''">- DISABLED</b></span>
          <select v-model="slideFields.workId">
            <option disabled selected value="null">Please choose work</option>
            <option v-for="(item, index) of preparedWorks" :key="index" :value="item.id">
              {{ item.id + ": " + item.title }}
            </option>
          </select>
        </label>

        <!-- Photo -->
        <label class="dashboard__label">
          <span>Link slide to photo collection <b v-if="slideFields.photoId === ''">- DISABLED</b></span>
          <select v-model="slideFields.photoId">
            <option disabled selected value="null">Please choose photo collection</option>
            <option v-for="(item, index) of preparedPhotos" :key="index" :value="item.id">
              {{ item.id + ": " + item.title }}
            </option>
          </select>
        </label>

        <!-- Type -->
        <label class="dashboard__label">
          <span>Type of slide</span>
          <label class="dashboard__label mb0">
            <input type="radio" name="type" value="image" v-model="slideFields.type" :disabled="isEdit" />
            <span class="inline">image</span>
          </label>
          <label class="dashboard__label">
            <input type="radio" name="type" value="video" v-model="slideFields.type" :disabled="isEdit" />
            <span class="inline">video</span>
          </label>
        </label>

        <!-- IMG section -->
        <template v-if="slideFields.type === 'image'">
          <div class="dashboard__label">
            <span>Upload photo</span>
            <input type="file" @change="getFiles" ref="filesInput" />
          </div>
          <div class="dashboard__label">
            <ul class="dashboard__list-imgs">
              <li v-for="(file, idx) in slideFields.images" :key="idx">
                <span class="dashboard__badge badge-yellow">{{ idx + 1 }}</span>
                <button type="button" @click="removeSelectedImage(file.src)">remove</button>
                <img class="mb16" :src="file.src" alt="add" />
              </li>
            </ul>
          </div>
        </template>
        <!-- VIDEO section -->
        <template v-else>
          <label class="dashboard__label">
            <span>Vimeo video</span>
            <input type="text" v-model="slideFields.videos.vimeoId" placeholder="vimeo ID" />
          </label>
        </template>

        <!-- client errors -->
        <label class="dashboard__label">
          <ul v-if="clientErrors.length" class="dashboard__error-list">
            <li v-for="error in clientErrors" :key="error"><span>{{ error }}</span></li>
          </ul>
        </label>

        <!-- btns -->
        <div class="dashboard__btns-container">
          <button type="submit" class="dashboard__submit" v-if="isEdit" :disabled="isLoading">Update</button>
          <button type="submit" class="dashboard__submit" v-else :disabled="isLoading">Add</button>
          <button type="reset" class="dashboard__submit" @click="reset" :disabled="isLoading">Reset</button>
          <div class="dashboard__status">
            <div class="dashboard__status--success" v-if="isSuccess">Success</div>
            <div class="dashboard__status--fail" v-if="serverError">Server error: {{ serverError }}</div>
          </div>
          <Spiner v-if="isLoading" :isCenter="false" />
        </div>
      </div>

      <div class="dashboard__side dashboard__area-preview">
        <div class="dashboard-works-add__preview-cont">
          <template v-if="slideFields.type === 'image' && slideFields.images.length">
            <img class="dashboard__img" v-for="(item, index) in slideFields.images" :key="index" :src="item.src" alt="image" />
          </template>
          <template v-else-if="slideFields.type === 'video' && slideFields.videos.vimeoId">
            <VimeoVideoPlayer :id="slideFields.videos.vimeoId" />
          </template>
        </div>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import useVuelidate from "@vuelidate/core";
import { required, minLength } from "@vuelidate/validators";
import VimeoVideoPlayer from "@/components/VimeoVideoPlayer.vue";
import Spiner from "@/components/Spiner.vue";
import { getHeightAndWidthFromDataUrl } from "@/helper/index";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";

const SlidesRepository = RepositoryFactory.get("slides");

const props = defineProps<{
  slide?: Record<string, unknown>;
  slides?: unknown[];
  works?: Record<string, unknown>[];
  photos?: Record<string, unknown>[];
  isEdit?: boolean;
}>();

const emit = defineEmits<{
  "work-create-successfully": [];
  resetForm: [];
}>();

const filesInput = ref<HTMLInputElement | null>(null);
const isLoading = ref(false);
const isSuccess = ref(false);
const clientErrors = ref<string[]>([]);
const serverError = ref<string | null>(null);

const slideFields = ref({
  id: null as unknown,
  title: "title1",
  order: null as unknown,
  type: "image",
  images: [] as { src: string; file?: File; format?: string }[],
  videos: { vimeoId: null as string | null },
  workId: null as unknown,
  photoId: null as unknown,
});

const disableValue = { id: "", title: "disable" };

const title = computed(() => slideFields.value.title);
const rules = { title: { required, minLength: minLength(2) } };
const v$ = useVuelidate(rules, { title });

const slidersLength = computed(() => {
  const s = props.slides;
  if (!s) return [0];
  return Array.from({ length: Math.max(s.length) + 1 });
});

const preparedWorks = computed(() => {
  const works = props.works;
  return !works ? [disableValue] : [disableValue, ...works];
});

const preparedPhotos = computed(() => {
  const photos = props.photos;
  return !photos ? [disableValue] : [disableValue, ...photos];
});

watch(
  () => props.slide,
  () => { if (props.isEdit) setDataForEdit(); }
);

function reset() {
  slideFields.value.title = "";
  slideFields.value.order = null;
  slideFields.value.type = "image";
  slideFields.value.images = [];
  slideFields.value.videos = { vimeoId: null };
  emit("resetForm");
}

function getFiles() {
  slideFields.value.images = [];
  const files = filesInput.value?.files;
  if (!files) return;
  Array.from(files).forEach((file) => {
    getHeightAndWidthFromDataUrl(file).then((resolution) => {
      const format = resolution.height > resolution.width ? "vertical" : "horizontal";
      slideFields.value.images.push({ file, format, src: URL.createObjectURL(file) });
    });
  });
}

function removeSelectedImage(src: string) {
  slideFields.value.images = slideFields.value.images.filter((v) => v.src !== src);
}

function setOrder() {
  if (props.isEdit && props.slide) {
    slideFields.value.order = props.slide.order;
  } else if (props.slides) {
    slideFields.value.order = Array.from(props.slides).length;
  }
}

function setServerStatusInUI(isOk: boolean, statusText?: string) {
  if (isOk) {
    isSuccess.value = true;
    setTimeout(() => {
      isSuccess.value = false;
      emit("work-create-successfully");
    }, 10_000);
    serverError.value = null;
  } else {
    serverError.value = statusText ?? null;
    setTimeout(() => { serverError.value = null; }, 20_000);
  }
}

async function submit() {
  clientErrors.value = [];
  v$.value.$touch();
  if (v$.value.$invalid) return;

  const { order, type, videos, images, workId, photoId } = slideFields.value;
  const isImage = type === "image";

  if (isImage) {
    if (!images.length) { clientErrors.value.push("Please select at least one image"); return; }
  } else if (type === "video") {
    if (!videos.vimeoId) { clientErrors.value.push("Please provide vimeo video ID"); return; }
  } else {
    clientErrors.value.push("Something went wrong"); return;
  }

  if (order == null || !Number.isInteger(+String(order))) {
    clientErrors.value.push(`Please fill up the order field, now is ${order}`); return;
  }
  if (!workId && !photoId) {
    clientErrors.value.push("Please fill work or photo ID field"); return;
  }

  if (props.isEdit) { update(isImage); } else { create(isImage); }
}

function create(isImage: boolean) {
  try {
    const { title: t, order, type, videos, images, workId, photoId } = slideFields.value;
    const formData = new FormData();
    formData.append("type", type);
    formData.append("title", t);
    formData.append("order", String(order));
    if (workId || workId === "") formData.append("workId", String(workId));
    if (photoId || photoId === "") formData.append("photoId", String(photoId));

    if (isImage) {
      for (const photo of images) { if (photo.file) formData.append("photos[]", photo.file); }
    } else {
      formData.append("videos", JSON.stringify(videos));
    }

    isLoading.value = true;
    SlidesRepository.create(formData)
      .then(() => { reset(); setServerStatusInUI(true); })
      .catch((e: unknown) => {
        console.error(e);
        setServerStatusInUI(false, (e as { response?: { data?: { message?: string } } })?.response?.data?.message);
      })
      .finally(() => { isLoading.value = false; clientErrors.value = []; });
  } catch (err) {
    console.error("AddSlide ERROR", err);
  }
}

function setDataForEdit() {
  const s = props.slide;
  if (!s) return;
  const { id, title: t, order, type, image, videos, workId, photoId } = s;
  slideFields.value.id = id;
  slideFields.value.type = type as string;
  slideFields.value.title = t as string;
  slideFields.value.order = order;
  slideFields.value.images = [{ src: image as string }];
  slideFields.value.videos = videos
    ? typeof videos === "string" ? JSON.parse(videos) : { ...(videos as object) }
    : { vimeoId: null };
  slideFields.value.workId = workId;
  slideFields.value.photoId = photoId;
}

function update(isImage: boolean) {
  try {
    const { id, title: t, order, type, videos, images, workId, photoId } = slideFields.value;
    const formData = new FormData();
    formData.append("id", String(id));
    formData.append("type", type);
    formData.append("title", t);
    formData.append("order", String(order));
    if (workId) formData.append("workId", String(workId));
    if (photoId) formData.append("photoId", String(photoId));

    const image = images?.[0];
    if (isImage) {
      if (image?.src?.includes("blob") && image.file) formData.append("photos[]", image.file);
    } else {
      formData.append("videos", JSON.stringify(videos));
    }

    isLoading.value = true;
    SlidesRepository.update(formData)
      .then(() => { reset(); setServerStatusInUI(true); })
      .catch((e: unknown) => {
        console.error(e);
        setServerStatusInUI(false, (e as { response?: { data?: { message?: string } } })?.response?.data?.message);
      })
      .finally(() => { isLoading.value = false; clientErrors.value = []; });
  } catch (err) {
    console.error("AddSlide ERROR", err);
  }
}

onMounted(() => {
  if (props.isEdit) setDataForEdit();
  setOrder();
});
</script>
