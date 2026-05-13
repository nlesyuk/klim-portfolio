import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";

const RepositoryGeneral = RepositoryFactory.get("general");

export const useGeneralStore = defineStore("general", () => {
  const contacts = ref<Record<string, unknown> | null>(null);

  const theme = computed(() => (contacts.value as Record<string, unknown> | null)?.theme);

  async function fetchContacts() {
    try {
      const { data } = await RepositoryGeneral.getContacts();
      contacts.value = data;
    } catch (e) {
      console.error(e);
    }
  }

  return { contacts, theme, fetchContacts };
});
