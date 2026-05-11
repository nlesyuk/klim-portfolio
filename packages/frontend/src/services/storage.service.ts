export const keys = {
  user: "user",
  theme: "theme"
};

export default class StorageService {
  key: string;

  constructor(key = keys.user) {
    this.key = key;
  }

  get(): any {
    const res = localStorage.getItem(this.key);
    return res ? JSON.parse(res) : null;
  }

  set(data: any): boolean {
    localStorage.setItem(this.key, JSON.stringify(data));
    return true;
  }

  remove(): boolean {
    localStorage.removeItem(this.key);
    return true;
  }
}
