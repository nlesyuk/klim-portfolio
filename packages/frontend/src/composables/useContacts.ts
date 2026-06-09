import { computed } from "vue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { queryKeys } from "@/queries/keys";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";
import type { Contact } from "@/models";

const GeneralRepo = RepositoryFactory.get("general");

export function useContactsQuery() {
  const query = useQuery<Contact>({
    queryKey: queryKeys.contacts(),
    queryFn: () => GeneralRepo.getContacts().then((r) => r.data),
  });
  const theme = computed(() => query.data.value?.theme);
  return { ...query, theme };
}

export function useCreateContacts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => GeneralRepo.createContacts(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.contacts() }),
  });
}

export function useUpdateContacts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => GeneralRepo.updateContacts(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.contacts() }),
  });
}
