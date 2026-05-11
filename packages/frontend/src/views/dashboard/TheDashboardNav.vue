<template>
  <section class="dashboard-nav" v-if="!isDashboard">
    <nav class="dashboard-nav__menu">
      <router-link
        v-for="item in $options.menu"
        :key="item"
        tag="button"
        class="dashboard-nav__menu-item"
        :to="{ name: `dasboard-${item}` }"
      >
        {{ item }}
      </router-link>
      <router-link
        tag="button"
        class="dashboard-nav__menu-item"
        :to="{ name: 'dashboard' }"
      >
        dashboard
      </router-link>
      <button class="dashboard-nav__menu-item" role="logout" @click="logoutFn">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill-rule="evenodd"
          clip-rule="evenodd"
        >
          <path
            d="M16 2v7h-2v-5h-12v16h12v-5h2v7h-16v-20h16zm2 9v-4l6 5-6 5v-4h-10v-2h10z"
          />
        </svg>
      </button>
    </nav>
  </section>
</template>

<script>
import { mapActions } from "vuex";
import { menu } from "@/helper/constants";

export default {
  menu,
  computed: {
    isDashboard() {
      const path = this.$route.path;
      const isIncludes = path.split("/").some(v => ["dashboard"].includes(v));
      return isIncludes;
    }
  },
  methods: {
    ...mapActions("auth", ["logout"]),
    async logoutFn() {
      try {
        await this.logout();
      } catch (error) {}
      // eslint-disable-next-line no-console
      console.error("logout", error);
    }
  }
};
</script>
<style lang="scss" scoped>
$color: rgb(136, 136, 136);
$colorHover: rgb(75, 75, 75);

.dashboard-nav {
  position: fixed;
  left: 50%;
  top: 50%;
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

  box-shadow: rgb(204, 219, 232) 3px 3px 6px 0px inset,
    rgba(255, 255, 255, 0.5) -3px -3px 6px 1px inset;
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
      &:hover {
        color: $colorHover;
        cursor: pointer;
        transition: all 0.25s;
        svg {
          fill: $colorHover;
          transition: all 0.25s;
        }
      }

      svg {
        fill: $color;
        transition: all 0.25s;
      }
    }
  }
}
</style>
