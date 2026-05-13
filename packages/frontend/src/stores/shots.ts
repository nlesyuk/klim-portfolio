import { defineStore } from "pinia";
import { ref } from "vue";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";

const ShotsRepository = RepositoryFactory.get("shots");

export const useShotsStore = defineStore("shots", () => {
  const shots = ref<unknown[]>([]);
  const categories = ref(["all", "portrait", "landscape", "mood"]);

  async function getAllShots() {
    const { data } = await ShotsRepository.getAllShots();
    shots.value = data;
    return data;
  }

  return { shots, categories, getAllShots };
});
