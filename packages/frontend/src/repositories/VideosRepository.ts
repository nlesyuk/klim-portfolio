import Repository from "./Repository";

const resources = "work";

// use CRUD model for build repository
export default {
  getAllVideos() {
    return Repository.get(`${resources}`);
  },
  getVideo(id) {
    return Repository.get(`${resources}/${id}`);
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
