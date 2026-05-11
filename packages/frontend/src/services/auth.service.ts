import { RepositoryFactory } from "../repositories/RepositoryFactory";
const AuthRepository = RepositoryFactory.get("auth");
import StorageService from "./storage.service";
import { IUser } from "@/helper/interfaces";

export const userStorageService = new StorageService("user");

class AuthService {
  static instance;

  public static getInstance() {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(userCredentials) {
    try {
      const res = await AuthRepository.signin(userCredentials);
      const user = res?.data;
      if (user?.accessToken) {
        userStorageService.set(user); // save User data client storage
      }

      return Promise.resolve(user);
    } catch (error) {
      console.error(error);
      let msg = error?.response?.data?.message
        ? error?.response?.data?.message
        : error?.message;
      if (!msg) {
        msg = "Unknow an Error";
      }
      return Promise.reject(msg);
    }
  }

  async logout(userId: number) {
    try {
      if (userId) {
        await AuthRepository.signout(userId);
      }
      userStorageService.remove();
      return Promise.resolve(true);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  async signup(user) {
    try {
      if (user) {
        await AuthRepository.signup(user);
      }
      return Promise.resolve(true);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  async refreshToken(token) {
    try {
      if (token) {
        const res = await AuthRepository.refreshToken(token);
        const user: IUser | null = userStorageService.get();
        userStorageService.set({
          ...user
        });
        user?.accessToken;

        return Promise.resolve(res);
      }
      throw new Error("Token doesn't provided");
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  getAccessTokenFromStorage() {
    const user: IUser | null = userStorageService.get();
    return user?.accessToken;
  }
}

export default AuthService.getInstance();

// Автологин выглядит примерно так. Вы делаете запрос с фронта, он падает
// потому что протух токен, ловим ошибку по логину и с рефреш токеном идём на
// сервер за получением нового. Если рефреш не протух вы перелогинетесь иначе
// придётся вводить все заново
