import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { queryKeys } from "@/queries/keys";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";

const VideosRepo = RepositoryFactory.get("videos");

export function useVideosQuery() {
  return useQuery<Record<string, unknown>[]>({
    queryKey: queryKeys.videos(),
    queryFn: () => VideosRepo.getAllVideos().then((r: { data: Record<string, unknown>[] }) => r.data),
  });
}

export function useVideoQuery(id: unknown) {
  return useQuery<Record<string, unknown>>({
    queryKey: [...queryKeys.videos(), id],
    queryFn: () => VideosRepo.getVideo(id).then((r: { data: Record<string, unknown> }) => r.data),
    enabled: !!id,
  });
}

export function useCreateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => VideosRepo.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.videos() }),
  });
}

export function useUpdateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => VideosRepo.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.videos() }),
  });
}

export function useDeleteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: unknown) => VideosRepo.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.videos() }),
  });
}
