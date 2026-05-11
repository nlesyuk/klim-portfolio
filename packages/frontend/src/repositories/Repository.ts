import axios from "axios";
import StorageService, { keys } from "../services/storage.service";
const userStorageService = new StorageService(keys.user);
import { getRefreshToken } from "./AuthRepository";
import { domain, APIURL } from "@/helper/constants";

const instance = axios.create({
  timeout: 5000,
  baseURL: APIURL
});

instance.interceptors.request.use(
  req => {
    req.headers.domain = domain;
    const user = userStorageService.get();
    if (user?.accessToken) {
      req.headers["x-access-token"] = user.accessToken;
    }

    return req;
  },
  error => Promise.reject(error)
);

instance.interceptors.response.use(
  res => res,
  async err => {
    const originalConfig = err.config;

    if (err.response) {
      // Access Token was expired
      if (
        err.response.status === 401 &&
        !originalConfig._retry &&
        !originalConfig.url.includes("auth")
      ) {
        originalConfig._retry = true;
        try {
          const user = userStorageService.get();
          if (!user?.refreshToken) {
          }
          const rs = await getRefreshToken(instance, user?.refreshToken);
          const { accessToken, refreshToken } = rs.data;
          userStorageService.set({
            ...user,
            accessToken,
            refreshToken
          });

          instance.defaults.headers.common["x-access-token"] = accessToken;
          return instance(originalConfig);
        } catch (_error) {
          // const msg = _error?.response?.data;
          // msg ? msg : _error;
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
