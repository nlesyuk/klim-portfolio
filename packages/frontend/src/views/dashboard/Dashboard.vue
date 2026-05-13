<template>
  <section class="dashboard">
    <ul class="dashboard__menu">
      <li v-for="item in menuItems" :key="item">
        <button
          class="dashboard__menu-item glass-button1"
          @click="router.push({ name: `dasboard-${item}` })"
        >
          {{ item }}
        </button>
      </li>
      <li>
        <button class="dashboard__menu-item1 dashboard__menu-logout" role="logout" @click="logoutFn">
          <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
            <path d="M16 2v7h-2v-5h-12v16h12v-5h2v7h-16v-20h16zm2 9v-4l6 5-6 5v-4h-10v-2h10z" />
          </svg>
        </button>
      </li>
    </ul>
    <router-view />
    <h2
      class="dashboard__title dashboard__title--center dashboard__title--big-border"
      v-if="isDashboardRoute"
    >
      Hello, {{ username }}!
    </h2>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { menu } from "@/helper/constants";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const menuItems = menu;

const isDashboardRoute = computed(() => route.name === "dashboard");
const username = computed(() => {
  const name = (authStore.user as Record<string, unknown> | null)?.username as string | undefined;
  return name ? name.toUpperCase() : "Anonymous";
});

async function logoutFn() {
  try {
    await authStore.logout();
    router.push("/login");
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  if (!authStore.user) router.push("/login");
});
</script>
