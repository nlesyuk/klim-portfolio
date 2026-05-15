<template>
  <div class="shots">
    <div class="shots__tags">
      <button
        v-for="(name, idx) in categories"
        :key="idx"
        type="button"
        :class="['btn', 'btn-primary', { active: filter === name }]"
        @click="changeFilter(name)"
      >
        {{ name }}
      </button>
    </div>
    <transition name="fade" mode="out-in">
      <template v-if="toggle">
        <PhotosGrid
          v-if="filteredShots.length"
          :images="filteredShots"
          :is-shots="true"
        />
        <p v-else-if="filteredShots.length === 0" class="home__empty-category">
          Don't have any shots yet
        </p>
        <Spiner v-else />
      </template>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import PhotosGrid from "@/components/PhotosGrid.vue";
import Spiner from "@/components/Spiner.vue";
import { useShotsQuery, shotCategories } from "@/composables/useShots";
import { setTitle } from "@/helper";

const route = useRoute();
const router = useRouter();
const { data, isPending } = useShotsQuery();

const filter = computed(() => route.query.filter as string | undefined);
const categories = shotCategories;
const toggle = computed(() => !isPending.value);

const filteredShots = computed(() => {
  const all = data.value ?? [];
  const key = filter.value;
  if (!key || key === "all") return all;
  return all.filter((item) => item.categories?.includes(key));
});

function changeFilter(f: string) {
  if (route.query.filter !== f) {
    router.replace({ name: "shots", query: { filter: f } });
  }
}

onMounted(() => {
  setTitle("Shots");
});
</script>
