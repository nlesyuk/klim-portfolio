import Repository from "./Repository";

const resources = "contact";

export default {
  // contact
  getContacts() {
    return Repository.get(`${resources}`);
  },
  createContacts(payload) {
    return Repository.post(`${resources}`, payload);
  },
  updateContacts(payload) {
    return Repository.put(`${resources}`, payload);
  }
};
