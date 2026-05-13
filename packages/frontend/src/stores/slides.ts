import { defineStore } from "pinia";
import { ref } from "vue";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";

const SlidesRepository = RepositoryFactory.get("slides");

export const useSlidesStore = defineStore("slides", () => {
  const slides = ref<unknown[] | null>(null);

  async function getSlides() {
    try {
      const { data } = await SlidesRepository.get();
      slides.value = data;
    } catch (e) {
      console.error(e);
    }
  }

  return { slides, getSlides };
});
