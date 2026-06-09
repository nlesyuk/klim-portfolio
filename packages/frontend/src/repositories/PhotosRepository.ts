import Repository from "./Repository";
import type { AxiosResponse } from "axios";
import type { PhotoCollection } from "@/models";

const resources = "photos";

export default {
  create(payload: FormData): Promise<AxiosResponse<PhotoCollection>> {
    return Repository.post(`${resources}`, payload);
  },
  get(): Promise<AxiosResponse<PhotoCollection[]>> {
    return Repository.get(`${resources}`);
  },
  getById(id: number): Promise<AxiosResponse<PhotoCollection>> {
    return Repository.get(`${resources}/${id}`);
  },
  update(payload: FormData): Promise<AxiosResponse<PhotoCollection>> {
    return Repository.put(`${resources}`, payload);
  },
  delete(id: number | string | unknown): Promise<AxiosResponse<void>> {
    return Repository.delete(`${resources}/${id}`);
  },
};
