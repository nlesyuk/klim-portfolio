import Repository from "./Repository";
import type { AxiosResponse } from "axios";
import type { Shot } from "@/models";

const resources = "shot";

export default {
  getAllShots(): Promise<AxiosResponse<Shot[]>> {
    return Repository.get(`${resources}`);
  },
  create(payload: FormData): Promise<AxiosResponse<Shot[]>> {
    return Repository.post(`${resources}`, payload);
  },
  update(payload: FormData): Promise<AxiosResponse<Shot>> {
    return Repository.put(`${resources}`, payload);
  },
  delete(id: number | string | unknown): Promise<AxiosResponse<void>> {
    return Repository.delete(`${resources}/${id}`);
  },
};
