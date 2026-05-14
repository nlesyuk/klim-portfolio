import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { queryKeys } from "@/queries/keys";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";

const SlidesRepo = RepositoryFactory.get("slides");

export function useSlidesQuery() {
  return useQuery<Record<string, unknown>[]>({
    queryKey: queryKeys.slides(),
    queryFn: () => SlidesRepo.get().then((r: { data: Record<string, unknown>[] }) => r.data),
  });
}

export function useCreateSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => SlidesRepo.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.slides() }),
  });
}

export function useUpdateSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => SlidesRepo.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.slides() }),
  });
}

export function useDeleteSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: unknown) => SlidesRepo.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.slides() }),
  });
}
