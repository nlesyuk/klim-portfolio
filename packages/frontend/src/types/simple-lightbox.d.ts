declare module "simple-lightbox" {
  interface SimpleLightboxOptions {
    elements?: HTMLElement[] | NodeListOf<HTMLElement> | string;
    [key: string]: unknown;
  }
  class SimpleLightbox {
    constructor(options: SimpleLightboxOptions);
    destroy(): void;
    refresh(): void;
  }
  export = SimpleLightbox;
}
