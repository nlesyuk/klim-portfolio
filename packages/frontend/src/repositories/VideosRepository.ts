import Repository from "./Repository";
import type { AxiosResponse } from "axios";
import type { Work } from "@/models";

const resources = "work";

export default {
  getAllVideos(): Promise<AxiosResponse<Work[]>> {
    return Repository.get(`${resources}`);
  },
  getVideo(id: number | string | unknown): Promise<AxiosResponse<Work>> {
    return Repository.get(`${resources}/${id}`);
  },
  create(payload: FormData): Promise<AxiosResponse<Work>> {
    return Repository.post(`${resources}`, payload);
  },
  update(payload: FormData): Promise<AxiosResponse<Work>> {
    return Repository.put(`${resources}`, payload);
  },
  delete(id: number | string | unknown): Promise<AxiosResponse<void>> {
    return Repository.delete(`${resources}/${id}`);
  },
};
