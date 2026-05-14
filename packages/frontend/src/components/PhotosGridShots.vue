<template>
  <div>
    <template v-if="chunkedImages">
      <div class="grid-container" v-for="(arrImages, idx) in chunkedImages" :key="idx">
        <div class="grid-type grid-type--oneline" :class="{ 'grid-type--oneline-1': arrImages.length === 1, 'grid-type--oneline-2': arrImages.length === 2, 'grid-type--oneline-3': arrImages.length === 3 }">
          <figure v-for="(item, index) in arrImages" :key="index" class="grid__item">
            <ul class="dashboard__list" v-if="isManage">
              <li><button type="button" class="dashboard__btn-inline" @click.prevent="emit('removeImg', item.id)">Remove</button></li>
              <li><button type="button" class="dashboard__btn-inline" @click.prevent="emit('editImg', item.id)">Edit</button></li>
              <li><button type="button" class="dashboard__btn-inline" title="id" disabled>{{ item.id }}</button></li>
            </ul>
            <router-link class="grid__lightbox1" :to="{ name: 'work', params: { id: item.workId } }">
              <img :src="item.src" alt="" class="grid__img" loading="lazy" />
            </router-link>
          </figure>
        </div>
      </div>
    </template>
    <div v-else-if="chunkedImages === 0" class="grid-empty">Don't have any items yet</div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { chunk } from "lodash";
import SimpleLightbox from "simple-lightbox";
import type { Shot } from "@/models";

const props = withDefaults(defineProps<{ images: Shot[]; isManage?: boolean }>(), { isManage: false });
const emit = defineEmits<{ removeImg: [id: number]; editImg: [id: number] }>();

let lightbox: InstanceType<typeof SimpleLightbox> | null = null;

function installLightBox() {
  lightbox = new SimpleLightbox({ elements: ".grid-container .grid__lightbox" });
}
function uninstallLightBox() {
  if (lightbox) { lightbox.destroy(); lightbox = null; }
}

const chunkedImages = computed(() => {
  if (!props.images) return false;
  if (props.images.length === 0) return 0;
  return chunk(props.images, 3);
});

watch(() => props.images, (v) => {
  if (v.length) { uninstallLightBox(); nextTick(installLightBox); }
});

onMounted(() => nextTick(installLightBox));
onUnmounted(uninstallLightBox);
</script>
