import { useQuery } from "@tanstack/react-query";
import { fetchEmployeeStops } from "@/features/monitoring/api/monitoringApi";
import { monitoringKeys } from "./queryKeys";

export function useEmployeeStops(employeeId: number | null, date: string) {
  return useQuery({
    queryKey: monitoringKeys.stops(employeeId as number, date),
    queryFn: () => fetchEmployeeStops(employeeId as number, date),
    enabled: employeeId !== null,
    staleTime: 30 * 1000,
  });
}
