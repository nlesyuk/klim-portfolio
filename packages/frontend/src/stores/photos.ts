import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";
import { categories } from "@/helper/constants";

const PhotosRepository = RepositoryFactory.get("photos");

export const usePhotosStore = defineStore("photos", () => {
  const photos = ref<unknown[] | null>(null);
  const photoCategories = ref<string[]>(categories);

  const photosPersonal = computed(() =>
    (photos.value as Record<string, unknown>[] | null)?.filter((item: Record<string, unknown>) =>
      (item.categories as string[] | undefined)?.includes("personal")
    )
  );
  const photographerPhotos = computed(() => photosPersonal.value);
  const cinematographerPhotos = computed(() => photos.value);
  const cinematographerPhotosCommerce = computed(() =>
    (photos.value as Record<string, unknown>[] | null)?.filter((item: Record<string, unknown>) =>
      (item.categories as string[] | undefined)?.includes("commerce")
    )
  );

  async function getPhotos() {
    try {
      const { data } = await PhotosRepository.get();
      photos.value = data;
    } catch (e) {
      console.error(e);
    }
  }

  return { photos, photoCategories, photosPersonal, photographerPhotos, cinematographerPhotos, cinematographerPhotosCommerce, getPhotos };
});
