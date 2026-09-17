export const monitoringKeys = {
  employees: (regionId: number | null) => ["employees", regionId] as const,
  currentLocation: (employeeId: number) => ["employees", employeeId, "current-location"] as const,
  route: (employeeId: number, date: string) => ["employees", employeeId, "route", date] as const,
  stops: (employeeId: number, date: string) => ["employees", employeeId, "stops", date] as const,
};
