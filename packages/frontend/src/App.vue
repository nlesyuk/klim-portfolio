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

<script lang="ts">
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import SvgSprite from "./components/SVG-sprite.vue";
import { mapGetters } from "vuex";
import { themeInstance, themes } from "@/helper";

export default {
  computed: {
    ...mapGetters("auth", ["loggedIn"]),
    ...mapGetters(["theme"])
  },
  watch: {
    theme(themeName) {
      if (themes.includes(themeName)) {
        themeInstance.setInLS(themeName);
        themeInstance.init();
      }
    }
  },
  components: {
    Header,
    Footer,
    SvgSprite,
    TheDashboardNav: () => import("./views/dashboard/TheDashboardNav.vue")
  },
  mounted() {
    themeInstance.init();
  }
};
</script>
