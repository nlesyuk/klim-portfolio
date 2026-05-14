import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { queryKeys } from "@/queries/keys";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";

const ShotsRepo = RepositoryFactory.get("shots");

export const shotCategories = ["all", "portrait", "landscape", "mood"];

export function useShotsQuery() {
  return useQuery<Record<string, unknown>[]>({
    queryKey: queryKeys.shots(),
    queryFn: () => ShotsRepo.getAllShots().then((r: { data: Record<string, unknown>[] }) => r.data),
  });
}

export function useCreateShot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => ShotsRepo.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.shots() }),
  });
}

export function useUpdateShot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => ShotsRepo.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.shots() }),
  });
}

export function useDeleteShot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: unknown) => ShotsRepo.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.shots() }),
  });
}
