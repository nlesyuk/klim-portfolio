<template>
  <section class="dashboard-photos-add">
    <form class="dashboard__form dashboard__form--preview" @submit.prevent="submit">
      <div class="dashboard__side">
        <!-- id -->
        <label v-if="id" class="dashboard__label">
          <span>id: {{ id }}</span>
        </label>

        <!-- title -->
        <label :class="['dashboard__label', { 'dashboard__label-error': v$.title.$dirty && v$.title.$error }]">
          <span>Title</span>
          <input type="text" v-model="title" />
          <strong class="dashboard__label-error-info" v-if="v$.title.$dirty && v$.title.$error">
            Min length is 2
          </strong>
        </label>

        <!-- video -->
        <label :class="['dashboard__label', { 'dashboard__label-error': v$.videoId.$dirty && v$.videoId.$error }]">
          <span>Vimeo id</span>
          <input type="text" v-model="videoId" />
          <strong class="dashboard__label-error-info" v-if="v$.videoId.$dirty && v$.videoId.$error">
            Must be min length 9 and max length 20
          </strong>
        </label>

        <!-- Credits -->
        <label class="dashboard__label">
          <span>Credits</span>
          <RichEditor class="vue2editor" v-model="credits" placeholder="credits" />
        </label>

        <!-- Description -->
        <label class="dashboard__label">
          <span>Description</span>
          <RichEditor class="vue2editor" v-model="description" placeholder="description" />
        </label>

        <!-- Categories -->
        <label class="dashboard__label" v-if="categories">
          <span>Categories</span>
          <label class="dashboard__checkbox" v-for="cat in categories" :key="cat">
            <input type="checkbox" :value="cat" v-model="choosedCategories" />
            {{ cat }}
          </label>
        </label>

        <!-- files -->
        <div class="dashboard__label">
          <span>Please upload photos</span>
          <input type="file" multiple @change="getFiles" ref="filesInput" />
          <ul class="dashboard__list-imgs">
            <li v-for="(file, idx) in selectedImages" :key="idx">
              <span class="dashboard__badge badge-yellow">{{ idx + 1 }}</span>
              <button type="button" @click="removeSelectedImage(file)">delete</button>
              <img :src="file.src" alt="preview" />
              <label class="dashboard__label">
                <span>Please select order of photos if need</span>
                <select v-model="file.order">
                  <option disabled selected value="null">Please choose order</option>
                  <option v-for="(img, index) of images" :key="index" :value="index">{{ index }}</option>
                </select>
              </label>
              <label class="dashboard__label">
                <input type="checkbox" v-model="file.isPreview" :value="true" />
                <span class="inline">Is preview photo?</span>
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

        <!-- work order -->
        <label class="dashboard__label">
          <span>Order</span>
          <select v-model="order">
            <option disabled selected value="null">Please choose order</option>
            <option v-for="(item, index) in allPhotoCollections" :key="index" :value="index">
              {{ index }}
            </option>
          </select>
        </label>

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

      <!-- PREVIEW -->
      <div class="dashboard__side dashboard__area-preview">
        <div class="photos" v-if="selectedImages.length">
          <PhotosGrid :images="selectedImages" />
        </div>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import useVuelidate from "@vuelidate/core";
import { required, minLength, maxLength } from "@vuelidate/validators";
import PhotosGrid from "@/components/PhotosGrid.vue";
import RichEditor from "@/components/RichEditor.vue";
import Spiner from "@/components/Spiner.vue";
import { usePhotosQuery, useCreatePhoto, useUpdatePhoto } from "@/composables/usePhotos";
import { categories as photoCategoriesAll } from "@/helper/constants";

const { data: photosData } = usePhotosQuery();
const { mutateAsync: createPhoto } = useCreatePhoto();
const { mutateAsync: updatePhoto } = useUpdatePhoto();

const props = defineProps<{
  photoCollection?: Record<string, unknown>;
  isEdit?: boolean;
}>();

const emit = defineEmits<{ "work-create-successfully": [] }>();

const filesInput = ref<HTMLInputElement | null>(null);

const id = ref<unknown>(null);
const title = ref("");
const videoId = ref("");
const order = ref<unknown>(null);
const credits = ref("");
const description = ref("");
const choosedCategories = ref<string[]>([]);
const selectedImages = ref<Record<string, unknown>[]>([]);
const removedImages = ref<unknown[]>([]);
const isLoading = ref(false);
const isSuccess = ref(false);
const clientErrors = ref<string[]>([]);
const serverError = ref<string | null>(null);

const rules = {
  title: { required, minLength: minLength(2) },
  videoId: { minLength: minLength(9), maxLength: maxLength(20) },
};
const v$ = useVuelidate(rules, { title, videoId });

const categories = computed(() =>
  photoCategoriesAll.filter((v: string) => v !== "all")
);

const allPhotos = computed(() => photosData.value);

const allPhotoCollections = computed(() => {
  const count = Array.from(allPhotos.value ?? []).length;
  if (props.isEdit) return order.value && +order.value > count ? +order.value + 1 : count;
  return count ? count + 1 : 1;
});

const images = computed(() => selectedImages.value?.length ?? 1);

watch(allPhotoCollections, (v) => {
  if (!props.isEdit) order.value = (v as number) - 1;
}, { immediate: true });

function reset() {
  id.value = null;
  title.value = "";
  credits.value = "";
  choosedCategories.value = [];
  selectedImages.value = [];
}

function getFiles() {
  const files = filesInput.value?.files;
  if (!files) return;
  Array.from(files).forEach((file) => {
    const src = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const format = img.height > img.width ? "vertical" : "horizontal";
      const index = selectedImages.value.length ?? 1;
      selectedImages.value.push({ src, file, order: index, format, isPreview: false });
    };
    img.src = src;
  });
}

function removeSelectedImage(image: Record<string, unknown>) {
  if (props.isEdit) removedImages.value.push(image.id);
  selectedImages.value = selectedImages.value.filter((v) => v.src !== image.src);
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

function submit() {
  clientErrors.value = [];
  v$.value.$touch();
  if (v$.value.$invalid) return;

  const imgs = Array.from(selectedImages.value);
  if (imgs.length) {
    if (imgs.filter((v) => v.isPreview).length !== 3) {
      clientErrors.value.push("Please choose 3 preview images"); return;
    }
  } else {
    clientErrors.value.push("Please select at least one image"); return;
  }
  if (!order.value && order.value !== 0) {
    clientErrors.value.push("Please select order"); return;
  }
  if (!title.value) {
    clientErrors.value.push("Please fill title"); return;
  }

  if (props.isEdit) { update(); } else { create(); }
}

function create() {
  try {
    const formData = new FormData();
    formData.append("title", title.value);
    formData.append("order", String(order.value));
    formData.append("credits", credits.value);
    formData.append("description", description.value);
    if (choosedCategories.value) formData.append("categories", JSON.stringify(choosedCategories.value));
    for (const photo of selectedImages.value) formData.append("photos[]", photo.file as File);
    formData.append("photosInfo", JSON.stringify(
      selectedImages.value.map((v) => ({
        isPreview: v.isPreview,
        fileName: (v.file as File).name,
        format: v.format,
        order: v.order,
      }))
    ));
    isLoading.value = true;
    createPhoto(formData)
      .then(() => { reset(); setServerStatusInUI(true); })
      .catch((e: unknown) => { console.error(e); setServerStatusInUI(false, (e as { response?: { data?: { message?: string } } })?.response?.data?.message); })
      .finally(() => { isLoading.value = false; clientErrors.value = []; });
  } catch (e) { serverError.value = (e as Error).message; console.error(e); }
}

function setDataForEdit() {
  if (!props.photoCollection) return;
  const { id: pid, title: t, order: o, photos, credits: c, categories: cats, description: d } = props.photoCollection;
  id.value = pid;
  title.value = t as string;
  order.value = o;
  credits.value = c as string;
  choosedCategories.value = cats ? [...(cats as string[])] : [];
  description.value = d as string;
  selectedImages.value = JSON.parse(JSON.stringify(photos));
}

function update() {
  try {
    const formData = new FormData();
    const oldPhotos = Array.from(props.photoCollection?.photos as Record<string, unknown>[]);

    const newPhotoInfo = selectedImages.value.filter((v) => {
      if (v.file) { formData.append("photos[]", v.file as File); return true; }
      return false;
    }).map((v) => ({ order: v.order, format: v.format, fileName: (v.file as File).name, isPreview: v.isPreview }));

    const deletedPhotoIds = oldPhotos
      .filter((v) => !selectedImages.value.some((item) => item?.id === v?.id))
      .map((v) => v?.id);

    const updatePhotoInfo = selectedImages.value.filter((v, idx) => {
      const isNew = v.file;
      const isUpdated = JSON.stringify(v) !== JSON.stringify(oldPhotos[idx]);
      return isUpdated && !isNew;
    }) ?? [];

    const existingPhotoInfo = oldPhotos.filter((exphoto) =>
      !updatePhotoInfo.some((up) => up.id === exphoto.id)
    );

    formData.append("id", String(id.value));
    formData.append("title", title.value);
    formData.append("order", String(order.value));
    formData.append("credits", credits.value);
    formData.append("description", description.value);
    formData.append("photosInfo", JSON.stringify({ new: newPhotoInfo, existing: existingPhotoInfo, deleted: deletedPhotoIds, updated: updatePhotoInfo }));
    if (choosedCategories.value) formData.append("categories", JSON.stringify(choosedCategories.value));

    isLoading.value = true;
    updatePhoto(formData)
      .then(() => { setServerStatusInUI(true); })
      .catch((e: unknown) => { console.error(e); setServerStatusInUI(false, (e as { response?: { statusText?: string } })?.response?.statusText); })
      .finally(() => { isLoading.value = false; });
  } catch (e) { serverError.value = (e as Error).message; }
}

onMounted(() => {
  if (props.isEdit) setDataForEdit();
});
</script>

<style lang="scss">
.vue2editor .ql-editor {
  min-height: 50px;
}
</style>
