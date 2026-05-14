import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import StorageService, { keys } from "../services/storage.service";
import { getRefreshToken } from "./AuthRepository";
import { domain, APIURL } from "@/helper/constants";
import type { User } from "@/models";

const userStorageService = new StorageService(keys.user);

const instance = axios.create({
  timeout: 5000,
  baseURL: APIURL,
});

interface RetryRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

instance.interceptors.request.use(
  (req) => {
    req.headers.set?.("domain", domain);
    (req.headers as Record<string, unknown>).domain = domain;
    const user = userStorageService.get<User>();
    if (user?.accessToken) {
      (req.headers as Record<string, unknown>)["x-access-token"] = user.accessToken;
    }
    return req;
  },
  (error: AxiosError) => Promise.reject(error)
);

instance.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const originalConfig = err.config as RetryRequestConfig | undefined;

    if (err.response && originalConfig) {
      if (
        err.response.status === 401 &&
        !originalConfig._retry &&
        !originalConfig.url?.includes("auth")
      ) {
        originalConfig._retry = true;
        try {
          const user = userStorageService.get<User>();
          if (!user?.refreshToken) {
            return Promise.reject(err);
          }
          const rs = await getRefreshToken(instance, user.refreshToken);
          const { accessToken, refreshToken } = rs.data;
          userStorageService.set({ ...user, accessToken, refreshToken });
          instance.defaults.headers.common["x-access-token"] = accessToken;
          return instance(originalConfig);
        } catch (_error) {
          return Promise.reject(_error);
        }
      }
      if (err.response.status === 403 && err.response.data) {
        return Promise.reject(err.response.data);
      }
    }

    return Promise.reject(err);
  }
);

export default instance;
