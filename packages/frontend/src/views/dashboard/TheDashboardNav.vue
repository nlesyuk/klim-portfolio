<template>
  <section class="dashboard-nav" v-if="!isDashboard">
    <nav class="dashboard-nav__menu">
      <button
        v-for="item in menuItems"
        :key="item"
        class="dashboard-nav__menu-item"
        @click="router.push({ name: `dasboard-${item}` })"
      >
        {{ item }}
      </button>
      <button class="dashboard-nav__menu-item" @click="router.push({ name: 'dashboard' })">
        dashboard
      </button>
      <button class="dashboard-nav__menu-item" role="logout" @click="logoutFn">
        <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
          <path d="M16 2v7h-2v-5h-12v16h12v-5h2v7h-16v-20h16zm2 9v-4l6 5-6 5v-4h-10v-2h10z" />
        </svg>
      </button>
    </nav>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { menu } from "@/helper/constants";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const menuItems = menu;

const isDashboard = computed(() =>
  route.path.split("/").some((v) => ["dashboard"].includes(v))
);

async function logoutFn() {
  try {
    await authStore.logout();
  } catch (error) {
    console.error("logout", error);
  }
}
</script>

<style lang="scss" scoped>
$color: rgb(136, 136, 136);
$colorHover: rgb(75, 75, 75);

.dashboard-nav {
  position: fixed;
  left: 50%;
  top: 12px;
  width: auto;
  max-width: 100%;
  height: auto;
  padding: 0 8px;
  background-color: #e2e2e2;
  color: #999;
  z-index: 101;
  transform: translate(-50%, -50%);
  border-radius: 5px;
  box-shadow: rgb(204, 219, 232) 3px 3px 6px 0px inset, rgba(255, 255, 255, 0.5) -3px -3px 6px 1px inset;

  &__menu {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1px 0;

    &-item {
      background-color: transparent;
      border: none;
      padding: 0 6px;
      color: $color;
      transition: all 0.25s;
      cursor: pointer;

      &:hover {
        color: $colorHover;
        transition: all 0.25s;
        svg { fill: $colorHover; transition: all 0.25s; }
      }

      svg { fill: $color; transition: all 0.25s; }
    }
  }
}
</style>
