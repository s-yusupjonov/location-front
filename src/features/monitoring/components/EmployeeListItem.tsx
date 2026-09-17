import { StatusDot } from "@/shared/components/StatusDot";
import type { EmployeeWithStatus } from "@/shared/types/ui";
import "./EmployeeListItem.css";

interface EmployeeListItemProps {
  employee: EmployeeWithStatus;
  isSelected: boolean;
  onSelect: (employeeId: number) => void;
}

export function EmployeeListItem({ employee, isSelected, onSelect }: EmployeeListItemProps) {
  return (
    <button
      type="button"
      className={`employee-list-item ${isSelected ? "employee-list-item--selected" : ""}`}
      onClick={() => onSelect(employee.id)}
    >
      <div className="employee-list-item__row">
        <StatusDot isOnline={employee.isOnline} />
        <span className="employee-list-item__name">
          {employee.firstName} {employee.lastName}
        </span>
      </div>
      <span className="employee-list-item__meta">
        {employee.position} · {employee.department}
      </span>
      <span className="employee-list-item__phone">{employee.phoneNumber}</span>
    </button>
  );
}
