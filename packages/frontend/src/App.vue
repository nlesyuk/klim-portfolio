<template>
  <main id="app" class="container">
    <svg-sprite />
    <TheDashboardNav v-if="loggedIn" />
    <Header />
    <section class="content">
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </section>
    <Footer />
  </main>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, defineAsyncComponent } from "vue";
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import SvgSprite from "./components/SVG-sprite.vue";
import { useAuthStore } from "@/stores/auth";
import { useGeneralStore } from "@/stores/general";
import { themeInstance, themes } from "@/helper";

const TheDashboardNav = defineAsyncComponent(() => import("./views/dashboard/TheDashboardNav.vue"));

const authStore = useAuthStore();
const generalStore = useGeneralStore();

const loggedIn = computed(() => authStore.loggedIn);

watch(
  () => generalStore.theme,
  (themeName) => {
    if (themeName && themes.includes(themeName as string)) {
      themeInstance.setInLS(themeName as string);
      themeInstance.init();
    }
  }
);

onMounted(() => { themeInstance.init(); });
</script>
