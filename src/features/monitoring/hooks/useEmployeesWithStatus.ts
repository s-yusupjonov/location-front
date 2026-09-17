import { useQueries } from "@tanstack/react-query";
import { fetchCurrentLocation } from "@/features/monitoring/api/monitoringApi";
import { monitoringKeys } from "./queryKeys";
import type { EmployeeDto } from "@/shared/types/api";
import type { EmployeeWithStatus } from "@/shared/types/ui";

const ONLINE_THRESHOLD_MS = 15 * 60 * 1000;
const REFETCH_INTERVAL_MS = 60 * 1000;

function isRecent(timestamp: string): boolean {
  const time = new Date(timestamp).getTime();
  if (Number.isNaN(time)) return false;
  return Date.now() - time <= ONLINE_THRESHOLD_MS;
}

export function useEmployeesWithStatus(employees: EmployeeDto[] | undefined) {
  const list = employees ?? [];

  const results = useQueries({
    queries: list.map((employee) => ({
      queryKey: monitoringKeys.currentLocation(employee.id),
      queryFn: () => fetchCurrentLocation(employee.id),
      staleTime: REFETCH_INTERVAL_MS,
      refetchInterval: REFETCH_INTERVAL_MS,
      retry: 1,
    })),
  });

  const employeesWithStatus: EmployeeWithStatus[] = list.map((employee, index) => {
    const result = results[index];
    const location = result?.data;
    return {
      ...employee,
      isOnline: location ? isRecent(location.timestamp) : false,
      lastSeenAt: location?.timestamp ?? null,
      currentLatitude: location?.latitude ?? null,
      currentLongitude: location?.longitude ?? null,
    };
  });

  const isLoading = results.some((result) => result.isLoading);

  return { employeesWithStatus, isLoading };
}
