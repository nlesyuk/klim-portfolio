import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { queryKeys } from "@/queries/keys";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";
import type { Slide } from "@/models";

const SlidesRepo = RepositoryFactory.get("slides");

export function useSlidesQuery() {
  return useQuery<Slide[]>({
    queryKey: queryKeys.slides(),
    queryFn: () => SlidesRepo.get().then((r) => r.data),
  });
}

export function useCreateSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => SlidesRepo.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.slides() }),
  });
}

export function useUpdateSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => SlidesRepo.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.slides() }),
  });
}

export function useDeleteSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string | unknown) => SlidesRepo.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.slides() }),
  });
}
