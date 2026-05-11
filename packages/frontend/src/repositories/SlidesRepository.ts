import Repository from "./Repository";

const resources = "slider";

export default {
  create(payload) {
    return Repository.post(`${resources}`, payload);
  },
  get(id) {
    return id
      ? Repository.get(`${resources}/${id}`)
      : Repository.get(`${resources}`);
  },
  getById(id) {
    return Repository.get(`${resources}/${id}`);
  },
  update(payload) {
    return Repository.put(`${resources}`, payload);
  },
  delete(id) {
    return Repository.delete(`${resources}/${id}`);
  }
};
