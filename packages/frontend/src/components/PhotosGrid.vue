<template>
  <div>
    <template v-if="chunkedImages?.vertical">
      <div
        v-for="(arrImages, idx) in chunkedImages.vertical"
        :key="idx"
        class="grid-container"
      >
        <div
          class="grid-type grid-type--oneline"
          :class="{
            'grid-type--oneline-1': arrImages.length === 1,
            'grid-type--oneline-2': arrImages.length === 2,
            'grid-type--oneline-3': arrImages.length === 3,
          }"
        >
          <figure
            v-for="(image, index) in arrImages"
            :key="index"
            class="grid__item"
          >
            <ul v-if="isManage" class="dashboard__list">
              <li>
                <span class="dashboard__badge badge-green m0"
                  >id: {{ image.id }}</span
                >
              </li>
              <li>
                <button
                  type="button"
                  @click.prevent="emit('removeImg', image.id)"
                >
                  Remove
                </button>
              </li>
              <li>
                <button
                  type="button"
                  @click.prevent="emit('editImg', image.id)"
                >
                  Edit
                </button>
              </li>
            </ul>
            <button
              v-if="isShots"
              type="button"
              class="grid__btn"
              @click="goTo(image)"
            >
              MORE
            </button>
            <a ref="lightboxRefs" class="grid__lightbox" :href="image.src">
              <img :src="image.src" alt="" class="grid__img" loading="lazy" />
            </a>
          </figure>
        </div>
      </div>
    </template>
    <template v-if="chunkedImages?.horizontal">
      <div
        v-for="(arrImages, idx) in chunkedImages.horizontal"
        :key="`0${idx}`"
        class="grid-container"
      >
        <div
          class="grid-type"
          :class="{
            'grid-type--big-on-left': arrImages.length === 3 && (idx + 1) % 2,
            'grid-type--big-on-right':
              arrImages.length === 3 && !((idx + 1) % 2),
            'grid-type--two': arrImages.length === 2,
            'grid-type--one': arrImages.length === 1,
          }"
        >
          <figure
            v-for="(image, index) in arrImages"
            :key="index"
            class="grid__item"
          >
            <ul v-if="isManage" class="dashboard__list">
              <li>
                <span class="dashboard__badge badge-green m0"
                  >id: {{ image.id }}</span
                >
              </li>
              <li>
                <button
                  type="button"
                  @click.prevent="emit('removeImg', image.id)"
                >
                  Remove
                </button>
              </li>
              <li>
                <button
                  type="button"
                  @click.prevent="emit('editImg', image.id)"
                >
                  Edit
                </button>
              </li>
            </ul>
            <button
              v-if="isShots"
              type="button"
              class="grid__btn"
              @click="goTo(image)"
            >
              MORE
            </button>
            <a ref="lightboxRefs" class="grid__lightbox" :href="image.src">
              <img :src="image.src" alt="" class="grid__img" loading="lazy" />
            </a>
          </figure>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { chunk } from "lodash";
import SimpleLightbox from "simple-lightbox";
import "simple-lightbox/dist/simpleLightbox.min.css";
import type { Photo } from "@/models";

const props = withDefaults(
  defineProps<{
    images: Photo[];
    isManage?: boolean;
    isShots?: boolean;
    isWorks?: boolean;
  }>(),
  { isManage: false, isShots: false, isWorks: false },
);

const emit = defineEmits<{
  removeImg: [id: number | undefined];
  editImg: [id: number | undefined];
}>();

const router = useRouter();
const lightboxRefs = ref<HTMLElement[]>([]);
const lightbox = ref<InstanceType<typeof SimpleLightbox> | null>(null);

function installLightBox() {
  lightbox.value = new SimpleLightbox({ elements: lightboxRefs.value });
}
function uninstallLightBox() {
  if (lightbox.value) {
    lightbox.value.destroy();
    lightbox.value = null;
  }
}

function goTo(item: Photo) {
  if (Object.prototype.hasOwnProperty.call(item, "photoId"))
    router.push({ name: "photo", params: { id: item.photoId } });
  else if (Object.prototype.hasOwnProperty.call(item, "workId"))
    router.push({ name: "work", params: { id: item.workId } });
}

const chunkedImages = computed(() => {
  if (!props.images.length) return null;
  const sortOrder = (f: Photo, s: Photo) =>
    f?.order && s?.order ? f.order - s.order : 0;
  if (props.isWorks) {
    return { horizontal: chunk([...props.images].sort(sortOrder), 3) };
  }
  const verticals = [...props.images]
    .filter((v) => !v.format || v.format === "vertical")
    .sort(sortOrder);
  const horizontals = [...props.images]
    .filter((v) => !v.format || v.format === "horizontal")
    .sort(sortOrder);
  return { vertical: chunk(verticals, 3), horizontal: chunk(horizontals, 3) };
});

watch(
  () => props.images,
  (v) => {
    if (v.length) {
      uninstallLightBox();
      nextTick(installLightBox);
    }
  },
);

onMounted(() => nextTick(installLightBox));
onUnmounted(uninstallLightBox);
</script>
