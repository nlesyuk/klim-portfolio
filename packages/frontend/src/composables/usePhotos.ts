import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { queryKeys } from "@/queries/keys";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";
import type { PhotoCollection } from "@/models";

const PhotosRepo = RepositoryFactory.get("photos");

export function usePhotosQuery() {
  return useQuery<PhotoCollection[]>({
    queryKey: queryKeys.photos(),
    queryFn: () => PhotosRepo.get().then((r) => r.data),
  });
}

export function useCreatePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => PhotosRepo.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.photos() }),
  });
}

export function useUpdatePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => PhotosRepo.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.photos() }),
  });
}

export function useDeletePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string | unknown) => PhotosRepo.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.photos() }),
  });
}
