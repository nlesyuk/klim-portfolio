import Repository from "./Repository";
import type { AxiosResponse } from "axios";
import type { Slide } from "@/models";

const resources = "slider";

export default {
  create(payload: FormData): Promise<AxiosResponse<Slide>> {
    return Repository.post(`${resources}`, payload);
  },
  get(id?: number | string): Promise<AxiosResponse<Slide[]>> {
    return id
      ? Repository.get(`${resources}/${id}`)
      : Repository.get(`${resources}`);
  },
  getById(id: number | string): Promise<AxiosResponse<Slide>> {
    return Repository.get(`${resources}/${id}`);
  },
  update(payload: FormData): Promise<AxiosResponse<Slide>> {
    return Repository.put(`${resources}`, payload);
  },
  delete(id: number | string | unknown): Promise<AxiosResponse<void>> {
    return Repository.delete(`${resources}/${id}`);
  },
};
