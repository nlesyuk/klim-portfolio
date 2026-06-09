import Repository from "./Repository";
import type { AxiosResponse } from "axios";
import type { Contact } from "@/models";

const resources = "contact";

export default {
  getContacts(): Promise<AxiosResponse<Contact>> {
    return Repository.get(`${resources}`);
  },
  createContacts(payload: FormData): Promise<AxiosResponse<Contact>> {
    return Repository.post(`${resources}`, payload);
  },
  updateContacts(payload: FormData): Promise<AxiosResponse<Contact>> {
    return Repository.put(`${resources}`, payload);
  },
};
