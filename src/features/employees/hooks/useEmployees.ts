import { useQuery } from "@tanstack/react-query";
import { fetchEmployees } from "@/features/employees/api/employeesApi";
import { employeeKeys } from "@/shared/api/queryKeys";
import type { EmployeeFilters } from "@/shared/types/api";

export function useEmployees(filters: EmployeeFilters, enabled = true) {
  return useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: () => fetchEmployees(filters),
    enabled,
    staleTime: 60 * 1000,
  });
}
