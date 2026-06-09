<template>
  <section class="login">
    <form action="#" class="login__form" @submit.prevent="getLogin">
      <img
        src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
        class="login__profile-img"
      />
      <label class="login__label">
        <input
          v-model="username"
          type="text"
          name="email"
          placeholder="username"
        />
      </label>
      <label class="login__label">
        <input
          v-model="password"
          type="password"
          name="password"
          placeholder="password"
        />
      </label>
      <button type="submit" class="login__btn">Login</button>
      <p v-if="loading">Loading...</p>
      <p v-if="error" class="login__error">{{ error }}</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useNotify } from "@/composables/useNotify";

const router = useRouter();
const authStore = useAuthStore();
const { error: notifyError } = useNotify();

const username = ref("");
const password = ref("");
const error = ref<unknown>(null);
const loading = ref(false);

const loggedIn = computed(() => authStore.loggedIn);
const userRefreshToken = computed(
  () => (authStore.user as Record<string, unknown> | null)?.refreshToken,
);

onMounted(async () => {
  if (!loggedIn.value && userRefreshToken.value) {
    try {
      await authStore.refreshToken(userRefreshToken.value as string);
      authStore.setLoggedIn(true);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      notifyError(String(err));
    }
  } else if (loggedIn.value) {
    router.push("/dashboard");
  }
});

async function getLogin() {
  try {
    loading.value = true;
    await authStore.login({
      username: username.value,
      password: password.value,
    });
    router.push("/dashboard");
    error.value = "";
  } catch (err) {
    error.value = err;
  } finally {
    loading.value = false;
  }
}
</script>
