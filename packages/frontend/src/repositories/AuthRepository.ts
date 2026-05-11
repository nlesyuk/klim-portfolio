import Repository from "./Repository";

const resources = `auth`;

export default {
  signin(payload) {
    return Repository.post(`${resources}/signin`, payload);
  },
  signup(payload) {
    return Repository.post(`${resources}/signup`, payload);
  },
  signout(userId) {
    return Repository.post(`${resources}/logout`, { userId });
  },
  refreshToken(refreshToken) {
    return Repository.post(`${resources}/refreshtoken`, { refreshToken });
  }
};

export function getRefreshToken(axios, refreshToken) {
  return axios.post(`${resources}/refreshtoken`, { refreshToken });
}
