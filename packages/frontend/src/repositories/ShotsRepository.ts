import Repository from "./Repository";

const resources = "shot";

export default {
  getAllShots() {
    return Repository.get(`${resources}`);
  },
  create(payload) {
    return Repository.post(`${resources}`, payload);
  },
  update(payload) {
    return Repository.put(`${resources}`, payload);
  },
  delete(id) {
    return Repository.delete(`${resources}/${id}`);
  }
};
