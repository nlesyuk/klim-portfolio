<template>
  <section class="login">
    <form action="#" class="login__form" @submit.prevent="getLogin">
      <img
        src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
        class="login__profile-img"
      />
      <label class="login__label">
        <input
          type="text"
          name="email"
          v-model="username"
          placeholder="username"
        />
      </label>
      <label class="login__label">
        <input
          type="password"
          name="password"
          v-model="password"
          placeholder="password"
        />
      </label>
      <button type="submit" class="login__btn">
        Login
      </button>
      <p v-if="loading">Loading...</p>
      <p v-if="error" class="login__error">{{ error }}</p>
    </form>
  </section>
</template>

<script>
import { mapActions, mapMutations } from "vuex";

export default {
  data() {
    return {
      username: "",
      password: "",
      // username: "test",
      // password: "1234",
      error: null,
      loading: false
    };
  },
  computed: {
    userRefreshToken() {
      return this.$store.state.auth.user?.refreshToken;
    },
    loggedIn() {
      return this.$store.state.auth.status.loggedIn;
    }
  },
  async created() {
    // get data from LS and then send RefreshToken to server
    // if RefreshToken still fresh - update store and redirect to /dashboard
    // if not stay on login page
    if (!this.loggedIn && this.userRefreshToken) {
      try {
        await this.getAccessToken();
        await this.setToLoggedIn(true);
        this.$router.push("/dashboard");
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        this.$error(error);
      }
    } else if (this.loggedIn) {
      this.$router.push("/dashboard");
    }
  },
  methods: {
    ...mapActions("auth", ["login", "refreshToken"]),
    ...mapMutations("auth", ["setLoggedIn"]),

    async getLogin() {
      try {
        const user = {
          username: this.username,
          password: this.password
        };
        this.loading = true;

        await this.login(user);
        this.$router.push("/dashboard");

        this.error = "";
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },

    async getAccessToken() {
      await this.refreshToken(this.userRefreshToken);
    },

    async setToLoggedIn(isLoggedIn = false) {
      this.setLoggedIn(isLoggedIn);
    }
  }
};
</script>
