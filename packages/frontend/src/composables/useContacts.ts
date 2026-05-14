import { computed } from "vue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { queryKeys } from "@/queries/keys";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";

const GeneralRepo = RepositoryFactory.get("general");

export function useContactsQuery() {
  const query = useQuery<Record<string, unknown>>({
    queryKey: queryKeys.contacts(),
    queryFn: () => GeneralRepo.getContacts().then((r: { data: Record<string, unknown> }) => r.data),
  });
  const theme = computed(() => query.data.value?.theme as string | undefined);
  return { ...query, theme };
}

export function useCreateContacts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => GeneralRepo.createContacts(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.contacts() }),
  });
}

export function useUpdateContacts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => GeneralRepo.updateContacts(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.contacts() }),
  });
}
