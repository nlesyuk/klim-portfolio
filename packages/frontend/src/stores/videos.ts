import { defineStore } from "pinia";
import { ref } from "vue";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";

const VideosRepository = RepositoryFactory.get("videos");

export const useVideosStore = defineStore("videos", () => {
  const videos = ref<unknown[] | null>(null);

  async function getAllVideos() {
    try {
      const { data } = await VideosRepository.getAllVideos();
      videos.value = data;
    } catch (e) {
      console.error(e);
    }
  }

  return { videos, getAllVideos };
});
