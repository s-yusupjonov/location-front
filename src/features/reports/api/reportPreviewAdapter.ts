import { fetchEmployeeStops } from "@/features/monitoring/api/monitoringApi";
import { buildFullName } from "@/shared/utils/format";
import type { EmployeeDto, StopDto } from "@/shared/types/api";
import type { ReportPreviewRow } from "@/shared/types/ui";

export const IS_PREVIEW_SUPPORTED = true;

export function fetchPreviewSource(employeeId: number, date: string): Promise<StopDto[]> {
  return fetchEmployeeStops(employeeId, date);
}

export function toPreviewRows(
  employee: EmployeeDto,
  date: string,
  stops: StopDto[],
): ReportPreviewRow[] {
  const employeeName = buildFullName(employee.firstName, employee.lastName);
  return stops.map((stop) => ({
    key: `${employee.id}-${date}-${stop.id}`,
    employeeName,
    date,
    arrivalTime: stop.arrivalTime,
    departureTime: stop.departureTime,
    durationMinutes: stop.durationMinutes,
    address: stop.address ?? null,
    latitude: stop.latitude,
    longitude: stop.longitude,
  }));
}

export function sortPreviewRows(rows: ReportPreviewRow[]): ReportPreviewRow[] {
  return [...rows].sort((left, right) => {
    if (left.date !== right.date) return left.date.localeCompare(right.date);
    if (left.employeeName !== right.employeeName) {
      return left.employeeName.localeCompare(right.employeeName);
    }
    return left.arrivalTime.localeCompare(right.arrivalTime);
  });
}
