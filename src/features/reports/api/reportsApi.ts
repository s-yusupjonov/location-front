import { httpClient } from "@/shared/api/httpClient";

export async function downloadEmployeeReport(
  employeeId: number,
  from: string,
  to: string,
): Promise<Blob> {
  const response = await httpClient.get<Blob>(`/api/reports/employee/${employeeId}`, {
    params: { from, to },
    responseType: "blob",
  });
  return response.data;
}

export async function downloadDepartmentReport(
  departmentId: number,
  from: string,
  to: string,
): Promise<Blob> {
  const response = await httpClient.get<Blob>(`/api/reports/department/${departmentId}`, {
    params: { from, to },
    responseType: "blob",
  });
  return response.data;
}
