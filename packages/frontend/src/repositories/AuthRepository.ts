import Repository from "./Repository";
import type { AxiosInstance, AxiosResponse } from "axios";
import type { User } from "@/models";

const resources = "auth";

export interface SigninPayload {
  username: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export default {
  signin(payload: SigninPayload): Promise<AxiosResponse<User>> {
    return Repository.post(`${resources}/signin`, payload);
  },
  signup(payload: SignupPayload): Promise<AxiosResponse<User>> {
    return Repository.post(`${resources}/signup`, payload);
  },
  signout(userId: number): Promise<AxiosResponse<void>> {
    return Repository.post(`${resources}/logout`, { userId });
  },
  refreshToken(refreshToken: string): Promise<AxiosResponse<RefreshResponse>> {
    return Repository.post(`${resources}/refreshtoken`, { refreshToken });
  },
};

export function getRefreshToken(axios: AxiosInstance, refreshToken: string): Promise<AxiosResponse<RefreshResponse>> {
  return axios.post(`${resources}/refreshtoken`, { refreshToken });
}
