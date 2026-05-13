import { isCinematographerMode, isPhotographerMode } from "@/helper/constants";

export function useSiteMode() {
  return { isCinematographerMode, isPhotographerMode };
}
