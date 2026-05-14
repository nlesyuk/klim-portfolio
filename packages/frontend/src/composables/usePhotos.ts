import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { queryKeys } from "@/queries/keys";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";

const PhotosRepo = RepositoryFactory.get("photos");

export function usePhotosQuery() {
  return useQuery<Record<string, unknown>[]>({
    queryKey: queryKeys.photos(),
    queryFn: () => PhotosRepo.get().then((r: { data: Record<string, unknown>[] }) => r.data),
  });
}

export function useCreatePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => PhotosRepo.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.photos() }),
  });
}

export function useUpdatePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => PhotosRepo.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.photos() }),
  });
}

export function useDeletePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: unknown) => PhotosRepo.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.photos() }),
  });
}
