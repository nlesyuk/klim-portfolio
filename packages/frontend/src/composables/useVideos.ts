import { computed, type MaybeRefOrGetter, toValue } from "vue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { queryKeys } from "@/queries/keys";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";
import type { Work } from "@/models";

const VideosRepo = RepositoryFactory.get("videos");

export function useVideosQuery() {
  return useQuery<Work[]>({
    queryKey: queryKeys.videos(),
    queryFn: () => VideosRepo.getAllVideos().then((r) => r.data),
  });
}

export function useVideoQuery(
  id: MaybeRefOrGetter<number | string | undefined>,
) {
  return useQuery<Work>({
    queryKey: computed(() => [...queryKeys.videos(), toValue(id)]),
    queryFn: () => VideosRepo.getVideo(toValue(id)).then((r) => r.data),
    enabled: computed(() => !!toValue(id)),
  });
}

export function useCreateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => VideosRepo.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.videos() }),
  });
}

export function useUpdateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => VideosRepo.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.videos() }),
  });
}

export function useDeleteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string | unknown) => VideosRepo.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.videos() }),
  });
}
