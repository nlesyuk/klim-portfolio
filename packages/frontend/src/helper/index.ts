export * from "./constants";
import { author } from "./constants";
import StorageService, { keys } from "@/services/storage.service";
const storege = new StorageService(keys.theme);

export function setTitle(title) {
  const el = document.querySelector("title");
  if (el) el.innerText = `${author} | ${title}`;
}

export function handlerServerErrors(error) {
  return {
    status: error.response.status,
    statusText: error.response.statusText,
    message: error.response?.data?.message
  };
}

export function getHeightAndWidthFromDataUrl1(dataURL) {
  // dataURL must be created by URL.createObjectURL(file)
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      resolve({
        height: img.height,
        width: img.width
      });
    };
    img.src = dataURL;
  });
}

export function getHeightAndWidthFromDataUrl(file) {
  const src = URL.createObjectURL(file);
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      resolve({
        height: img.height,
        width: img.width
      });
    };
    img.src = src;
  });
}

export function getName(file) {
  if (!file?.src) {
    return "noname";
  }
  return `${file.src}`.split("/").pop();
}

class Theme {
  theme;
  htmlElement;
  key = keys.theme;

  constructor() {
    this.htmlElement = document?.documentElement;
  }

  setInDOM(themeName) {
    if (this.htmlElement) {
      this.htmlElement.setAttribute(this.key, themeName);
    }
  }

  setInLS(userTheme) {
    this.theme = userTheme;
    storege.set(this.theme);
  }

  getFromLS() {
    return storege.get();
  }

  init() {
    const userTheme = this.getFromLS();
    if (userTheme) {
      this.setInDOM(userTheme);
      return;
    }
  }

  setNewTheme(themeName) {
    this.setInLS(themeName);
    this.setInDOM(themeName);
  }
}

export const themeInstance = new Theme();
