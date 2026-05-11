import Repository from "./Repository";

const resources = "category";

export default {
  create(payload) {
    return Repository.post(`${resources}`, payload);
  },
  get() {
    return Repository.get(`${resources}`);
  },
  getById(id) {
    return Repository.get(`${resources}/${id}`);
  },
  update(payload) {
    return Repository.put(`${resources}`, payload);
  },
  delete(id) {
    return Repository.put(`${resources}/${id}`);
  }
};
