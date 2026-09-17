import { useFuzzySearch } from "@/shared/hooks/useFuzzySearch";
import type { DepartmentDto } from "@/shared/types/api";

const searchKeys = ["name"];

export function useDepartmentFuzzySearch(
  departments: DepartmentDto[],
  query: string,
): DepartmentDto[] {
  return useFuzzySearch<DepartmentDto>(departments, searchKeys, query);
}
