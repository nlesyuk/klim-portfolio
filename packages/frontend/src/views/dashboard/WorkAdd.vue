<template>
  <section class="dashboard-works-add">
    <form class="dashboard__form dashboard__form--preview" @submit.prevent="submit">
      <div class="dashboard__side">
        <p class="dashboard__text">
          * для корректного відображення всі фото мають бути одного розміру
        </p>

        <label :class="['dashboard__label', { 'dashboard__label-error': v$.title.$dirty && v$.title.$error }]">
          <span>Title</span>
          <input type="text" v-model="title" />
          <strong class="dashboard__label-error-info" v-if="v$.title.$dirty && v$.title.$error">
            Min length is 2
          </strong>
        </label>

        <!-- order -->
        <label class="dashboard__label">
          <span>Order</span>
          <select v-model="order">
            <option disabled selected value="null">Please choose order</option>
            <option v-for="(w, index) of worksLength" :key="index" :value="index">{{ index }}</option>
          </select>
        </label>

        <label :class="['dashboard__label', { 'dashboard__label-error': v$.videoId.$dirty && v$.videoId.$error }]">
          <span>Vimeo id</span>
          <input type="text" v-model="videoId" />
          <strong class="dashboard__label-error-info" v-if="v$.videoId.$dirty && v$.videoId.$error">
            Must be min length 9 and max length 20
          </strong>
        </label>

        <label class="dashboard__label">
          <span>Description under title</span>
          <RichEditor class="vue2editor" v-model="description" placeholder="description" />
        </label>

        <label class="dashboard__label">
          <span>Credits</span>
          <RichEditor class="vue2editor" v-model="credits" placeholder="credits" />
        </label>

        <!-- upload work -->
        <div class="dashboard__label">
          <span>Upload photos</span>
          <input type="file" multiple @change="getFiles" ref="filesInput" />
        </div>

        <div class="dashboard__label">
          <!-- files: edit -->
          <ul class="dashboard__list-imgs" v-if="isEdit">
            <li v-for="(file, idx) in selectedImages" :key="idx">
              <span class="dashboard__badge badge-yellow">{{ idx + 1 }}</span>
              <button type="button" @click="deleteExistingImage(file.id)">delete</button>
              <span>{{ getName(file) }}</span>
              <img :src="file.src" alt="edit" />
              <label class="dashboard__label">
                <span>Please select order of photos if need</span>
                <select v-model="file.order">
                  <option disabled selected value="null">Please choose order</option>
                  <option v-for="(img, index) of wholeWorkOrders" :key="index" :value="index">{{ index }}</option>
                </select>
              </label>
              <label class="dashboard__label">
                <input type="checkbox" v-model="file.isPreview" :value="true" />
                <span class="inline">Is preview photo?</span>
              </label>
              <label class="dashboard__label mb0">
                <input type="radio" :name="`edit-format${idx}`" value="vertical" v-model="file.format" />
                <span class="inline">vertical</span>
              </label>
              <label class="dashboard__label">
                <input type="radio" :name="`edit-format${idx}`" value="horizontal" v-model="file.format" />
                <span class="inline">horizontal</span>
              </label>
            </li>
          </ul>

          <!-- files: add -->
          <ul class="dashboard__list-imgs" v-else>
            <li v-for="(file, idx) in selectedImages" :key="idx">
              <span class="dashboard__badge badge-yellow">{{ idx + 1 }}</span>
              <button type="button" @click="removeSelectedImage(file.src)">remove</button>
              <p :class="['dashboard__size', { oversize: (file.file?.size ?? 0) / 1024 >= allowedImageSizeInKb }]">
                {{ getSize(file.file?.size ?? 0) }}
              </p>
              <p class="dashboard__img-name">{{ file.file?.name }}</p>
              <img :src="file.src" alt="image preview" />
              <label class="dashboard__label">
                <span>Please select order of photos if need</span>
                <select v-model="file.order">
                  <option disabled selected value="null">Please choose order</option>
                  <template v-if="isEdit">
                    <option v-for="(img, index) of [...selectedImages, ...(work?.photos ?? [])]" :key="index" :value="index">
                      {{ [...selectedImages, ...(work?.photos ?? [])].length - index }}
                    </option>
                  </template>
                  <template v-else>
                    <option v-for="(img, index) of selectedImages" :key="index" :value="index">{{ index }}</option>
                  </template>
                </select>
              </label>
              <label class="dashboard__label">
                <input type="checkbox" v-model="file.isPreview" :value="true" />
                <span class="inline">Is preview photo?</span>
              </label>
              <label v-for="format in photoFormat" class="dashboard__label mb0" :key="format">
                <input type="radio" :name="`photo_format-${idx}`" :value="format" v-model="file.format" />
                <span class="inline">{{ format }}</span>
              </label>
            </li>
          </ul>
        </div>

        <!-- work order -->
        <label class="dashboard__label">
          <ul v-if="clientErrors.length" class="dashboard__error-list">
            <li v-for="error in clientErrors" :key="error"><span>{{ error }}</span></li>
          </ul>
          <select v-model="order" v-if="worksLength.length">
            <option disabled selected value="null">Please choose order</option>
            <option v-for="(w, index) in worksLength" :key="index" :value="index">
              {{ index }}
            </option>
          </select>
        </label>

        <div class="dashboard__btns-container">
          <button type="submit" class="dashboard__submit" v-if="isEdit" :disabled="isLoading">Update work</button>
          <button type="submit" class="dashboard__submit" v-else :disabled="isLoading">Add work</button>
          <button type="reset" class="dashboard__submit" @click="reset" :disabled="isLoading">Reset</button>
          <Spiner v-if="isLoading" :isCenter="false" />
          <div class="dashboard__status">
            <div class="dashboard__status--success" v-if="isSuccess">Work was added</div>
            <div class="dashboard__status--fail" v-if="serverError">Server error: {{ serverError }}</div>
          </div>
        </div>
      </div>

      <div class="dashboard__side dashboard__area-preview">
        <div class="dashboard-works-add__preview-cont" v-if="previewWork && previewWork.photos && previewWork.photos.length">
          <WorkView :isPreview="true" :previewWork="previewWork" />
        </div>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import useVuelidate from "@vuelidate/core";
import { required, minLength, maxLength } from "@vuelidate/validators";
import WorkView from "@/views/Work.vue";
import RichEditor from "@/components/RichEditor.vue";
import Spiner from "@/components/Spiner.vue";
import { useCreateVideo, useUpdateVideo } from "@/composables/useVideos";
import { getHeightAndWidthFromDataUrl } from "@/helper/index";
import { allowedImageSizeInKb } from "@/helper";
import type { Work } from "@/models";

const { mutateAsync: createVideo } = useCreateVideo();
const { mutateAsync: updateVideo } = useUpdateVideo();

interface WorkPhotoDraft {
  id?: number;
  src?: string;
  file?: File;
  format?: string;
  order?: number;
  isPreview?: boolean;
}

const props = defineProps<{
  work?: Work;
  works?: Work[];
  isEdit?: boolean;
}>();

const emit = defineEmits<{
  "work-create-successfully": [];
  resetForm: [];
}>();

const filesInput = ref<HTMLInputElement | null>(null);
const title = ref("");
const credits = ref("");
const videoId = ref("");
const description = ref("");
const order = ref<number | null>(null);
const selectedImages = ref<WorkPhotoDraft[]>([]);
const isLoading = ref(false);
const isSuccess = ref(false);
const clientErrors = ref<string[]>([]);
const serverError = ref<string | null>(null);
const photoFormat = ["vertical", "horizontal"];

const rules = {
  title: { required, minLength: minLength(2) },
  videoId: { required, minLength: minLength(9), maxLength: maxLength(20) },
};
const v$ = useVuelidate(rules, { title, videoId });

const previewWork = computed<Partial<Work>>(() => {
  const base = { title: title.value, credits: credits.value, description: description.value, videos: { vimeoId: videoId.value } };
  const drafts = selectedImages.value.map((d) => ({ ...d, src: d.src ?? "" }));
  if (props.isEdit) return { ...base, photos: drafts };
  const workPhotos = props.work?.photos ?? [];
  return { ...base, photos: [...drafts, ...workPhotos] };
});

const worksLength = computed(() => {
  if (!props.works) return [];
  const arr = props.works.map((v) => v.order);
  const len = arr?.length ? Math.max(...arr) + 2 : 1;
  return Array.from({ length: len });
});

const getMaxOrderNumber = computed(() => {
  const orders = selectedImages.value?.map((v) => +(v.order ?? 0));
  return Math.max(...orders);
});

const wholeWorkOrders = computed(() => {
  return Array.from({ length: getMaxOrderNumber.value + 1 || 1 });
});

watch(() => props.work, () => { if (props.isEdit) setDataForEdit(); });

function reset() {
  title.value = "";
  description.value = "";
  credits.value = "";
  videoId.value = "";
  order.value = null;
  selectedImages.value = [];
  emit("resetForm");
}

async function getFiles() {
  const files = filesInput.value?.files;
  if (!files) return;
  let idx = selectedImages.value?.length ?? 0;
  for (const file of Array.from(files)) {
    const resolution = await getHeightAndWidthFromDataUrl(file);
    const format = resolution.height > resolution.width ? "vertical" : "horizontal";
    selectedImages.value.push({ file, order: idx, isPreview: false, format, src: URL.createObjectURL(file) });
    idx++;
  }
}

function removeSelectedImage(src: unknown) {
  selectedImages.value = selectedImages.value.filter((v) => v.src !== src);
}

function setOrder() {
  if (props.isEdit && props.work) {
    order.value = props.work.order;
  } else if (props.works) {
    order.value = props.works.length;
  }
}

function setServerStatusInUI(isOk: boolean, statusText?: string) {
  if (isOk) {
    isSuccess.value = true;
    setTimeout(() => { isSuccess.value = false; emit("work-create-successfully"); }, 10_000);
    serverError.value = null;
  } else {
    serverError.value = statusText ?? null;
    setTimeout(() => { serverError.value = null; }, 20_000);
  }
}

function getName(file: Record<string, unknown>): string {
  return `${file.src}`.split("/").pop() ?? "";
}

function getSize(sizeInByte: number): string {
  let name = "Kb";
  let size: string | number = Math.floor(sizeInByte / 1024);
  if (size >= 1024) { name = "Mb"; size = (size / 1024).toFixed(2); }
  return `${size} ${name}`;
}

async function submit() {
  clientErrors.value = [];
  v$.value.$touch();
  if (v$.value.$invalid) return;

  const imgs = Array.from(selectedImages.value);
  if (imgs.length) {
    if (!imgs.some((v) => v.isPreview)) {
      clientErrors.value.push("Please choose preview image for the work"); return;
    }
  } else {
    clientErrors.value.push("Please select at least one image"); return;
  }

  if (props.isEdit) { update(); } else { create(); }
}

function create() {
  try {
    const formData = new FormData();
    formData.append("title", title.value);
    formData.append("credits", credits.value);
    formData.append("order", String(order.value));
    formData.append("description", description.value);
    formData.append("videos", JSON.stringify({ vimeoId: videoId.value }));
    for (const photo of selectedImages.value) formData.append("photos[]", photo.file as File);
    formData.append("photosInfo", JSON.stringify(
      selectedImages.value.map((v) => ({ isPreview: v.isPreview, fileName: (v.file as File).name, format: v.format, order: v.order }))
    ));
    isLoading.value = true;
    createVideo(formData)
      .then(() => { reset(); setServerStatusInUI(true); })
      .catch((e: unknown) => { console.error(e); setServerStatusInUI(false, (e as { response?: { data?: { message?: string } } })?.response?.data?.message); })
      .finally(() => { isLoading.value = false; clientErrors.value = []; });
  } catch (err) { console.error("AddWork ERROR", err); }
}

function setDataForEdit() {
  if (!props.work) return;
  title.value = props.work.title as string;
  credits.value = props.work.credits as string;
  description.value = props.work.description as string;
  videoId.value = (props.work.videos as { vimeoId: string }).vimeoId;
  selectedImages.value = JSON.parse(JSON.stringify(props.work.photos));
}

function update() {
  const WORK = props.work!;
  const formData = new FormData();
  const videos = JSON.stringify({ vimeoId: videoId.value });
  const oldPhotos = Array.from(WORK.photos);

  const newPhotoInfo = selectedImages.value.filter((v) => {
    if (v.file) { formData.append("photos[]", v.file as File); return true; }
    return false;
  }).map((v) => ({ order: v.order, format: v.format, fileName: (v.file as File).name, isPreview: v.isPreview }));

  const deletedPhotoIds = (WORK.deletedPhotoIds as unknown[] | undefined)?.map((id) => id || id === 0) ?? [];

  const updatePhotoInfo = selectedImages.value.filter((v, idx) => {
    const isNew = v.file;
    const isUpdated = JSON.stringify(v) !== JSON.stringify(oldPhotos[idx]);
    return isUpdated && !isNew;
  });

  const existingPhotoInfo = oldPhotos.filter((ex) => !updatePhotoInfo.some((up) => up.id === ex.id));

  formData.append("id", String(WORK.id));
  formData.append("title", title.value);
  formData.append("videos", videos);
  formData.append("credits", credits.value);
  formData.append("order", String(order.value));
  formData.append("description", description.value);
  formData.append("photosInfo", JSON.stringify({ new: newPhotoInfo, existing: existingPhotoInfo, deleted: deletedPhotoIds, updated: updatePhotoInfo }));

  isLoading.value = true;
  updateVideo(formData)
    .then(() => { reset(); setServerStatusInUI(true); })
    .catch((e: unknown) => { console.info("Update work ERROR", e); setServerStatusInUI(false, (e as { response?: { statusText?: string } })?.response?.statusText); })
    .finally(() => { isLoading.value = false; });
}

function deleteExistingImage(id: number | undefined) {
  selectedImages.value = selectedImages.value.filter((v) => v.id !== id);
  if (id == null) return;
  const work = props.work;
  if (!work) return;
  if (work.deletedPhotoIds) {
    work.deletedPhotoIds.push(id);
  } else {
    work.deletedPhotoIds = [id];
  }
}

onMounted(() => {
  if (props.isEdit) setDataForEdit();
  setOrder();
});
</script>
