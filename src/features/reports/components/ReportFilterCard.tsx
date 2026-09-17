import { useState } from "react";
import { Button, DatePicker, Segmented, Select } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { strings } from "@/shared/strings";
import { buildFullName, DATE_FORMAT } from "@/shared/utils/format";
import { useEmployeeFuzzySearch } from "@/features/employees/hooks/useEmployeeFuzzySearch";
import { useDepartmentFuzzySearch } from "@/features/reports/hooks/useDepartmentFuzzySearch";
import type { DepartmentDto, EmployeeDto } from "@/shared/types/api";
import type { ReportMode } from "@/shared/types/ui";
import "./ReportFilterCard.css";

interface ReportFilterCardProps {
  mode: ReportMode;
  employees: EmployeeDto[];
  departments: DepartmentDto[];
  selectedEmployeeId: number | null;
  selectedDepartmentId: number | null;
  fromDate: Dayjs | null;
  toDate: Dayjs | null;
  isEmployeesLoading: boolean;
  isDepartmentsLoading: boolean;
  isDownloading: boolean;
  canDownload: boolean;
  onModeChange: (mode: ReportMode) => void;
  onEmployeeChange: (employeeId: number | null) => void;
  onDepartmentChange: (departmentId: number | null) => void;
  onFromDateChange: (value: Dayjs | null) => void;
  onToDateChange: (value: Dayjs | null) => void;
  onDownload: () => void;
}

const modeOptions = [
  { value: "employee", label: strings.reports.modeEmployee },
  { value: "department", label: strings.reports.modeDepartment },
];

export function ReportFilterCard({
  mode,
  employees,
  departments,
  selectedEmployeeId,
  selectedDepartmentId,
  fromDate,
  toDate,
  isEmployeesLoading,
  isDepartmentsLoading,
  isDownloading,
  canDownload,
  onModeChange,
  onEmployeeChange,
  onDepartmentChange,
  onFromDateChange,
  onToDateChange,
  onDownload,
}: ReportFilterCardProps) {
  const [employeeQuery, setEmployeeQuery] = useState("");
  const [departmentQuery, setDepartmentQuery] = useState("");

  const matchedEmployees = useEmployeeFuzzySearch(employees, employeeQuery);
  const matchedDepartments = useDepartmentFuzzySearch(departments, departmentQuery);

  return (
    <section className="report-filter">
      <Segmented
        className="report-filter__mode"
        value={mode}
        options={modeOptions}
        onChange={(value) => onModeChange(value as ReportMode)}
      />

      <div className="report-filter__row">
        {mode === "employee" ? (
          <div className="report-filter__field report-filter__field--wide">
            <span className="report-filter__label">{strings.reports.employeeLabel}</span>
            <Select
              value={selectedEmployeeId ?? undefined}
              onChange={(value: number | undefined) => onEmployeeChange(value ?? null)}
              onSearch={setEmployeeQuery}
              placeholder={strings.reports.employeePlaceholder}
              loading={isEmployeesLoading}
              showSearch
              allowClear
              filterOption={false}
              options={matchedEmployees.map((employee) => ({
                value: employee.id,
                label: buildFullName(employee.firstName, employee.lastName),
              }))}
            />
          </div>
        ) : (
          <div className="report-filter__field report-filter__field--wide">
            <span className="report-filter__label">{strings.reports.departmentLabel}</span>
            <Select
              value={selectedDepartmentId ?? undefined}
              onChange={(value: number | undefined) => onDepartmentChange(value ?? null)}
              onSearch={setDepartmentQuery}
              placeholder={strings.reports.departmentPlaceholder}
              loading={isDepartmentsLoading}
              showSearch
              allowClear
              filterOption={false}
              options={matchedDepartments.map((department) => ({
                value: department.id,
                label: department.name,
              }))}
            />
          </div>
        )}

        <div className="report-filter__field">
          <span className="report-filter__label">{strings.reports.fromLabel}</span>
          <DatePicker
            value={fromDate}
            onChange={onFromDateChange}
            format={DATE_FORMAT}
            placeholder={strings.reports.fromPlaceholder}
            disabledDate={(date) => date.isAfter(dayjs(), "day")}
          />
        </div>

        <div className="report-filter__field">
          <span className="report-filter__label">{strings.reports.toLabel}</span>
          <DatePicker
            value={toDate}
            onChange={onToDateChange}
            format={DATE_FORMAT}
            placeholder={strings.reports.toPlaceholder}
            disabledDate={(date) =>
              date.isAfter(dayjs(), "day") || (fromDate !== null && date.isBefore(fromDate, "day"))
            }
          />
        </div>

        <Button
          type="primary"
          className="report-filter__download"
          onClick={onDownload}
          loading={isDownloading}
          disabled={!canDownload}
        >
          {strings.reports.download}
        </Button>
      </div>
    </section>
  );
}
