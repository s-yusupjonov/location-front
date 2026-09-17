import { useQuery } from "@tanstack/react-query";
import { fetchEmployeeRoute } from "@/features/monitoring/api/monitoringApi";
import { monitoringKeys } from "./queryKeys";

export function useEmployeeRoute(employeeId: number | null, date: string) {
  return useQuery({
    queryKey: monitoringKeys.route(employeeId as number, date),
    queryFn: () => fetchEmployeeRoute(employeeId as number, date),
    enabled: employeeId !== null,
    staleTime: 30 * 1000,
  });
}
