import { useQuery } from "@tanstack/react-query";
import { fetchEmployees } from "@/features/employees/api/employeesApi";
import { monitoringKeys } from "./queryKeys";

export function useEmployees(regionId: number | null) {
  return useQuery({
    queryKey: monitoringKeys.employees(regionId),
    queryFn: () =>
      fetchEmployees({ regionId, districtId: null, departmentId: null }),
    enabled: regionId !== null,
    staleTime: 60 * 1000,
  });
}
