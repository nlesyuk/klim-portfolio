<template>
  <div v-if="works" class="works">
    <figure
      v-for="(item, idx) in sortedWorks"
      :key="idx"
      class="work"
      :style="getPreviewStyle(item.id)"
      style="cursor: pointer"
      @click="router.push({ path: `/work/${item.id}` })"
    >
      <ul v-if="isAdmin" class="dashboard__list">
        <li>
          <button
            type="button"
            class="dashboard__btn-inline"
            @click.stop="emit('delete', item.id)"
          >
            Remove
          </button>
        </li>
        <li>
          <button
            type="button"
            class="dashboard__btn-inline"
            @click.stop="emit('edit', item.id)"
          >
            Edit
          </button>
        </li>
        <li>
          <button
            type="button"
            class="dashboard__btn-inline"
            title="id"
            disabled
          >
            {{ item.id }}
          </button>
        </li>
        <li>
          <button
            type="button"
            class="dashboard__btn-inline"
            title="order"
            disabled
          >
            {{ item.order }}
          </button>
        </li>
      </ul>
      <div class="work__description">
        <h2 class="work__title">{{ item.title }}</h2>
      </div>
    </figure>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import type { Work } from "@/models";

const props = withDefaults(
  defineProps<{ works: Work[]; isAdmin?: boolean }>(),
  { isAdmin: false },
);
const emit = defineEmits<{ edit: [id: number]; delete: [id: number] }>();
const router = useRouter();

const sortedWorks = computed(() =>
  [...props.works].sort((a, b) => b.order - a.order),
);

function getPreviewPhoto(id: number) {
  const work = props.works.find((v) => v.id === id);
  const previews = work?.photos.filter((v) => v.isPreview) ?? [];
  return previews[0]?.src ?? "";
}

function getPreviewStyle(id: number) {
  return `background-image: url(${getPreviewPhoto(id)})`;
}
</script>
