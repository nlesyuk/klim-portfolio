import { useQuery } from "@tanstack/vue-query";
import { queryKeys } from "@/queries/keys";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";

const CategoriesRepo = RepositoryFactory.get("categories");

export function useCategoriesQuery() {
  return useQuery<Record<string, unknown>[]>({
    queryKey: queryKeys.categories(),
    queryFn: () => CategoriesRepo.get().then((r: { data: Record<string, unknown>[] }) => r.data),
  });
}
