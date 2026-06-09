import { RepositoryFactory } from "../repositories/RepositoryFactory";
import StorageService from "./storage.service";
import type { User } from "@/models";

const AuthRepository = RepositoryFactory.get("auth");

export const userStorageService = new StorageService("user");

interface ErrorWithResponse {
  response?: { data?: { message?: string } };
  message?: string;
}

class AuthService {
  static instance: AuthService | null = null;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(userCredentials: {
    username: string;
    password: string;
  }): Promise<User> {
    try {
      const res = await AuthRepository.signin(userCredentials);
      const user = res?.data as User;
      if (user?.accessToken) {
        userStorageService.set(user);
      }
      return user;
    } catch (error) {
      console.error(error);
      const e = error as ErrorWithResponse;
      const msg = e?.response?.data?.message ?? e?.message ?? "Unknown error";
      return Promise.reject(msg);
    }
  }

  async logout(userId: number): Promise<boolean> {
    try {
      if (userId) {
        await AuthRepository.signout(userId);
      }
      userStorageService.remove();
      return true;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  async signup(user: {
    username: string;
    email: string;
    password: string;
  }): Promise<boolean> {
    try {
      if (user) {
        await AuthRepository.signup(user);
      }
      return true;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  async refreshToken(token: string) {
    try {
      if (!token) throw new Error("Token doesn't provided");
      const res = await AuthRepository.refreshToken(token);
      const user = userStorageService.get() as User | null;
      userStorageService.set({ ...user });
      return res;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  getAccessTokenFromStorage(): string | undefined {
    const user = userStorageService.get() as User | null;
    return user?.accessToken;
  }
}

export default AuthService.getInstance();
