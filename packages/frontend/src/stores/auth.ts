import { defineStore } from "pinia";
import { ref } from "vue";
import AuthService, { userStorageService } from "@/services/auth.service";
import type { IUser } from "@/helper/interfaces";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<IUser | null>(userStorageService.get());
  const loggedIn = ref(!!user.value);

  async function login(credentials: { username: string; password: string }) {
    const userData = await AuthService.login(credentials);
    user.value = userData;
    loggedIn.value = true;
    return userData;
  }

  async function logout() {
    const userId = user.value?.id;
    await AuthService.logout(userId as number);
    user.value = null;
    loggedIn.value = false;
  }

  async function refreshToken(token: string) {
    const res = await AuthService.refreshToken(token);
    const { accessToken, refreshToken } = res.data;
    if (user.value) {
      user.value = { ...user.value, accessToken, refreshToken };
    }
    return { accessToken, refreshToken };
  }

  function setLoggedIn(value: boolean) {
    loggedIn.value = value;
  }

  return { user, loggedIn, login, logout, refreshToken, setLoggedIn };
});
