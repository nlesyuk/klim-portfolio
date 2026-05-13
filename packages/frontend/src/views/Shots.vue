<template>
  <div class="shots">
    <div class="shots__tags">
      <button
        type="button"
        v-for="(name, idx) in categories"
        :key="idx"
        @click="changeFilter(name)"
        :class="['btn', 'btn-primary', { active: filter === name }]"
      >
        {{ name }}
      </button>
    </div>
    <transition name="fade" mode="out-in">
      <template v-if="toggle">
        <PhotosGrid v-if="filteredShots.length" :images="filteredShots" :is-shots="true" />
        <p v-else-if="filteredShots.length === 0" class="home__empty-category">
          Don't have any shots yet
        </p>
        <Spiner v-else />
      </template>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import PhotosGrid from "@/components/PhotosGrid.vue";
import Spiner from "@/components/Spiner.vue";
import { useShotsStore } from "@/stores/shots";
import { setTitle } from "@/helper";

const route = useRoute();
const router = useRouter();
const shotsStore = useShotsStore();

const toggle = ref(true);
const filteredShots = ref<unknown[]>([]);

const filter = computed(() => route.query.filter as string | undefined);
const categories = computed(() => shotsStore.categories);

watch(route, (r) => { applyFilter(r.query.filter as string | undefined); });

function applyFilter(key: string | undefined) {
  const all = shotsStore.shots as Record<string, unknown>[];
  filteredShots.value = key === "all" || !key
    ? all
    : all.filter((item) => (item.categories as string[]).includes(key));
}

function changeFilter(f: string) {
  toggle.value = false;
  if (route.query.filter !== f) {
    router.replace({ name: "shots", query: { filter: f } });
    applyFilter(f);
    setTimeout(() => { toggle.value = true; }, 300);
  }
}

onMounted(async () => {
  setTitle("Shots");
  if (!shotsStore.shots.length) {
    const data = await shotsStore.getAllShots();
    filteredShots.value = data ?? [];
    if (filter.value) applyFilter(filter.value);
  } else {
    filteredShots.value = shotsStore.shots as unknown[];
  }
});
</script>
