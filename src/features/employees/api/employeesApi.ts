import { httpClient } from "@/shared/api/httpClient";
import type {
  EmployeeAssignmentPayload,
  EmployeeDto,
  EmployeeFilters,
} from "@/shared/types/api";

export async function fetchEmployees(filters: EmployeeFilters): Promise<EmployeeDto[]> {
  const response = await httpClient.get<EmployeeDto[]>("/api/employees", {
    params: {
      regionId: filters.regionId ?? undefined,
      districtId: filters.districtId ?? undefined,
      departmentId: filters.departmentId ?? undefined,
    },
  });
  return response.data;
}

export async function fetchEmployeeById(employeeId: number): Promise<EmployeeDto> {
  const response = await httpClient.get<EmployeeDto>(`/api/employees/${employeeId}`);
  return response.data;
}

export async function assignEmployee(
  employeeId: number,
  payload: EmployeeAssignmentPayload,
): Promise<EmployeeDto> {
  const response = await httpClient.patch<EmployeeDto>(
    `/api/employees/${employeeId}/assignment`,
    payload,
  );
  return response.data;
}

export async function deactivateEmployee(employeeId: number): Promise<void> {
  await httpClient.delete(`/api/employees/${employeeId}`);
}
