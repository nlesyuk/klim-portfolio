export * from "./constants";
import { author } from "./constants";
import StorageService, { keys } from "@/services/storage.service";

const storege = new StorageService(keys.theme);

export interface ImageResolution {
  height: number;
  width: number;
}

export interface ServerErrorShape {
  status: number;
  statusText: string;
  message?: string;
}

export function setTitle(title: string): void {
  const el = document.querySelector("title");
  if (el) el.innerText = `${author} | ${title}`;
}

export function handlerServerErrors(error: unknown): ServerErrorShape {
  const e = error as {
    response?: {
      status: number;
      statusText: string;
      data?: { message?: string };
    };
  };
  return {
    status: e.response?.status ?? 0,
    statusText: e.response?.statusText ?? "",
    message: e.response?.data?.message,
  };
}

export function getHeightAndWidthFromDataUrl1(
  dataURL: string,
): Promise<ImageResolution> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ height: img.height, width: img.width });
    img.src = dataURL;
  });
}

export function getHeightAndWidthFromDataUrl(
  file: File,
): Promise<ImageResolution> {
  const src = URL.createObjectURL(file);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ height: img.height, width: img.width });
    img.src = src;
  });
}

export function getName(file: { src?: string } | null | undefined): string {
  if (!file?.src) return "noname";
  return `${file.src}`.split("/").pop() ?? "noname";
}

class Theme {
  theme: string | null = null;
  htmlElement: HTMLElement | null;
  key = keys.theme;

  constructor() {
    this.htmlElement = document?.documentElement ?? null;
  }

  setInDOM(themeName: string) {
    if (this.htmlElement) {
      this.htmlElement.setAttribute(this.key, themeName);
    }
  }

  setInLS(userTheme: string) {
    this.theme = userTheme;
    storege.set(this.theme);
  }

  getFromLS(): string | null {
    return storege.get<string>();
  }

  init() {
    const userTheme = this.getFromLS();
    if (userTheme) this.setInDOM(userTheme);
  }

  setNewTheme(themeName: string) {
    this.setInLS(themeName);
    this.setInDOM(themeName);
  }
}

export const themeInstance = new Theme();
