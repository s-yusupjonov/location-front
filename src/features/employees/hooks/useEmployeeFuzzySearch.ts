import { useMemo } from "react";
import { useFuzzySearch } from "@/shared/hooks/useFuzzySearch";
import { buildFullName } from "@/shared/utils/format";
import type { EmployeeDto } from "@/shared/types/api";

interface IndexedEmployee extends EmployeeDto {
  fullName: string;
  initials: string;
}

const searchKeys = ["fullName", "initials"];

export function useEmployeeFuzzySearch(employees: EmployeeDto[], query: string): EmployeeDto[] {
  const indexed = useMemo<IndexedEmployee[]>(
    () =>
      employees.map((employee) => {
        const fullName = buildFullName(employee.firstName, employee.lastName);
        return {
          ...employee,
          fullName,
          initials: fullName
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part.slice(0, 3))
            .join(""),
        };
      }),
    [employees],
  );

  return useFuzzySearch<IndexedEmployee>(indexed, searchKeys, query);
}
