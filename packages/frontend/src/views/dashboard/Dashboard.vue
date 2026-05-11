<template>
  <section class="dashboard">
    <!--  -->
    <ul class="dashboard__menu">
      <li v-for="item in $options.menu" :key="item">
        <router-link
          tag="button"
          class="dashboard__menu-item glass-button1"
          :to="{ name: `dasboard-${item}` }"
        >
          {{ item }}
        </router-link>
      </li>
      <li>
        <button
          class="dashboard__menu-item1 dashboard__menu-logout"
          role="logout"
          @click="logoutFn"
        >
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
      </li>
    </ul>
    <!--  -->
    <router-view></router-view>
    <!--  -->
    <h2
      class="dashboard__title dashboard__title--center dashboard__title--big-border"
      v-if="isDashboardRoute"
    >
      Hello, {{ username }}!
    </h2>
  </section>
</template>

<script>
import { mapActions } from "vuex";
import { menu } from "@/helper/constants";

export default {
  menu,
  computed: {
    isDashboardRoute() {
      return this.$route.name === "dashboard";
    },
    currentUser() {
      return this.$store.state.auth.user;
    },
    username() {
      const name = this.currentUser?.username;
      return name ? `${name}`.toUpperCase() : "Anonymous";
    }
  },
  methods: {
    ...mapActions("auth", ["logout"]),
    async logoutFn() {
      try {
        await this.logout();
        this.$router.push("/login");
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }
  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push("/login");
    }
  }
};
</script>
