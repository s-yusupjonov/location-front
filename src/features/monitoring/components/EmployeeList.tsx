import { Input, Spin } from "antd";
import { strings } from "@/shared/strings";
import { EmptyState } from "@/shared/components/EmptyState";
import { EmployeeListItem } from "./EmployeeListItem";
import type { EmployeeWithStatus } from "@/shared/types/ui";
import "./EmployeeList.css";

interface EmployeeListProps {
  employees: EmployeeWithStatus[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedEmployeeId: number | null;
  onSelectEmployee: (employeeId: number) => void;
  isRegionSelected: boolean;
  isLoading: boolean;
  isEmpty: boolean;
  isSearchEmpty: boolean;
}

export function EmployeeList({
  employees,
  searchQuery,
  onSearchChange,
  selectedEmployeeId,
  onSelectEmployee,
  isRegionSelected,
  isLoading,
  isEmpty,
  isSearchEmpty,
}: EmployeeListProps) {
  return (
    <div className="employee-list">
      <Input
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={strings.monitoring.searchPlaceholder}
        disabled={!isRegionSelected}
        allowClear
        size="large"
        className="employee-list__search"
      />
      <div className="employee-list__scroll">
        {!isRegionSelected && (
          <EmptyState message={strings.monitoring.selectRegionFirst} />
        )}
        {isRegionSelected && isLoading && (
          <div className="employee-list__loading">
            <Spin />
          </div>
        )}
        {isRegionSelected && !isLoading && isEmpty && (
          <EmptyState message={strings.monitoring.employeeListEmpty} />
        )}
        {isRegionSelected && !isLoading && !isEmpty && isSearchEmpty && (
          <EmptyState message={strings.monitoring.searchEmpty} />
        )}
        {isRegionSelected &&
          !isLoading &&
          !isSearchEmpty &&
          employees.map((employee) => (
            <EmployeeListItem
              key={employee.id}
              employee={employee}
              isSelected={employee.id === selectedEmployeeId}
              onSelect={onSelectEmployee}
            />
          ))}
      </div>
    </div>
  );
}
