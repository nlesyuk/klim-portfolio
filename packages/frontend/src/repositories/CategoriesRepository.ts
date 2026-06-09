import Repository from "./Repository";
import type { AxiosResponse } from "axios";
import type { Category } from "@/models";

const resources = "category";

export default {
  create(payload: FormData): Promise<AxiosResponse<Category>> {
    return Repository.post(`${resources}`, payload);
  },
  get(): Promise<AxiosResponse<Category[]>> {
    return Repository.get(`${resources}`);
  },
  getById(id: number | string): Promise<AxiosResponse<Category>> {
    return Repository.get(`${resources}/${id}`);
  },
  update(payload: FormData): Promise<AxiosResponse<Category>> {
    return Repository.put(`${resources}`, payload);
  },
  delete(id: number | string): Promise<AxiosResponse<void>> {
    return Repository.put(`${resources}/${id}`);
  },
};
