import { useMemo } from "react";
import { useFuzzySearch } from "@/shared/hooks/useFuzzySearch";
import { buildFullName } from "@/shared/utils/format";
import type { EmployeeWithStatus } from "@/shared/types/ui";

const searchKeys = ["fullName"];

export function useEmployeeFuzzySearch(employees: EmployeeWithStatus[], query: string) {
  const indexed = useMemo(
    () =>
      employees.map((employee) => ({
        ...employee,
        fullName: buildFullName(employee.firstName, employee.lastName),
      })),
    [employees],
  );

  return useFuzzySearch(indexed, searchKeys, query);
}
