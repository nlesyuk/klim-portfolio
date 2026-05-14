import { useQuery } from "@tanstack/vue-query";
import { queryKeys } from "@/queries/keys";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";
import type { Category } from "@/models";

const CategoriesRepo = RepositoryFactory.get("categories");

export function useCategoriesQuery() {
  return useQuery<Category[]>({
    queryKey: queryKeys.categories(),
    queryFn: () => CategoriesRepo.get().then((r) => r.data),
  });
}
