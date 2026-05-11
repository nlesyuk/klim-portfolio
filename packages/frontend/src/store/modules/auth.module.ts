import AuthService, { userStorageService } from "@/services/auth.service";
import { IUser } from "@/helper/interfaces";

const user: IUser = userStorageService.get();

export default {
  namespaced: true,
  state: {
    status: {
      loggedIn: false
    },
    user: user
  },
  getters: {
    loggedIn(state) {
      return state.status.loggedIn;
    }
  },
  mutations: {
    loginSuccess(state, user) {
      state.status.loggedIn = true;
      state.user = user;
    },
    loginFailure(state) {
      state.status.loggedIn = false;
      state.user = null;
    },
    logout(state) {
      state.status.loggedIn = false;
      state.user = null;
    },
    registerSuccess(state) {
      state.status.loggedIn = false;
    },
    registerFailure(state) {
      state.status.loggedIn = false;
    },
    setAccessRefreshTokens(state, tokens) {
      const { accessToken, refreshToken } = tokens;
      state.user = {
        ...state.user,
        accessToken,
        refreshToken
      };
    },
    //
    setLoggedIn(state, isLoggedIn) {
      state.status.loggedIn = isLoggedIn;
    }
  },
  actions: {
    async login({ commit }, user) {
      try {
        const userData = await AuthService.login(user);
        commit("loginSuccess", userData);
        return Promise.resolve(userData);
      } catch (error) {
        commit("loginFailure");
        return Promise.reject(error);
      }
    },

    async logout({ commit, state }) {
      try {
        const userId = state.user?.id;
        await AuthService.logout(userId);
        commit("logout");
      } catch (error) {
        // somthing went wrong with logout
        console.error("Vuex logout error", error);
      }
    },

    async signup({ commit }, user) {
      try {
        const res = await AuthService.signup(user);
        commit("registerSuccess", res);
        return Promise.resolve(res);
      } catch (error) {
        commit("Vuex registerFailure", error);
        return Promise.reject(error);
      }
    },

    async refreshToken({ commit }, refrshToken) {
      try {
        const res = await AuthService.refreshToken(refrshToken);
        const { accessToken, refreshToken } = res.data;
        const tokens = { accessToken, refreshToken };
        commit("setAccessRefreshTokens", tokens);
        return Promise.resolve(tokens);
      } catch (error) {
        commit("Vuex refreshToken", error);
        return Promise.reject(error);
      }
    }
  }
};
