import type { EmployeeFilters } from "@/shared/types/api";

export const referenceKeys = {
  regions: ["regions"] as const,
  districts: (regionId: number | null) => ["districts", regionId] as const,
  departments: ["departments"] as const,
  positions: ["positions"] as const,
};

export const employeeKeys = {
  all: ["employees"] as const,
  list: (filters: EmployeeFilters) =>
    ["employees", "list", filters.regionId, filters.districtId, filters.departmentId] as const,
  detail: (employeeId: number) => ["employees", employeeId] as const,
};

export const reportKeys = {
  preview: (employeeId: number, date: string) =>
    ["employees", employeeId, "stops", date] as const,
};
