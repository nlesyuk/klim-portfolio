import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { queryKeys } from "@/queries/keys";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";
import type { Shot } from "@/models";

const ShotsRepo = RepositoryFactory.get("shots");

export const shotCategories = ["all", "portrait", "landscape", "mood"];

export function useShotsQuery() {
  return useQuery<Shot[]>({
    queryKey: queryKeys.shots(),
    queryFn: () => ShotsRepo.getAllShots().then((r) => r.data),
  });
}

export function useCreateShot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => ShotsRepo.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.shots() }),
  });
}

export function useUpdateShot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => ShotsRepo.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.shots() }),
  });
}

export function useDeleteShot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string | unknown) => ShotsRepo.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.shots() }),
  });
}
