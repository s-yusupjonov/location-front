import { useCallback, useMemo, useState } from "react";
import { Alert, App } from "antd";
import type { Dayjs } from "dayjs";
import { strings } from "@/shared/strings";
import { PageHeader } from "@/shared/components/PageHeader";
import { DATE_FORMAT, buildFullName } from "@/shared/utils/format";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useDepartments } from "@/features/reference-data/hooks/useDepartments";
import { useReportDownload } from "@/features/reports/hooks/useReportDownload";
import { useReportPreview } from "@/features/reports/hooks/useReportPreview";
import { ReportFilterCard } from "./ReportFilterCard";
import { ReportPreviewTable } from "./ReportPreviewTable";
import type { EmployeeDto } from "@/shared/types/api";
import type { ReportMode } from "@/shared/types/ui";
import "./ReportsPage.css";

const allEmployeesFilter = { regionId: null, districtId: null, departmentId: null };

export function ReportsPage() {
  const { message } = App.useApp();
  const [mode, setMode] = useState<ReportMode>("employee");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);

  const employeesQuery = useEmployees(allEmployeesFilter);
  const departmentsQuery = useDepartments();
  const download = useReportDownload();

  const employees = useMemo(() => employeesQuery.data ?? [], [employeesQuery.data]);
  const departments = useMemo(() => departmentsQuery.data ?? [], [departmentsQuery.data]);

  const from = fromDate ? fromDate.format(DATE_FORMAT) : null;
  const to = toDate ? toDate.format(DATE_FORMAT) : null;

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === selectedEmployeeId) ?? null,
    [employees, selectedEmployeeId],
  );

  const selectedDepartment = useMemo(
    () => departments.find((department) => department.id === selectedDepartmentId) ?? null,
    [departments, selectedDepartmentId],
  );

  const previewEmployees = useMemo<EmployeeDto[]>(() => {
    if (mode === "employee") {
      return selectedEmployee ? [selectedEmployee] : [];
    }
    if (selectedDepartmentId === null) return [];
    return employees.filter(
      (employee) =>
        employee.departmentId === selectedDepartmentId ||
        (selectedDepartment !== null && employee.department === selectedDepartment.name),
    );
  }, [mode, selectedEmployee, selectedDepartmentId, selectedDepartment, employees]);

  const preview = useReportPreview(previewEmployees, from, to);

  const canDownload =
    from !== null &&
    to !== null &&
    (mode === "employee" ? selectedEmployeeId !== null : selectedDepartmentId !== null);

  const handleDownload = useCallback(() => {
    if (!canDownload || from === null || to === null) {
      message.warning(strings.reports.selectTargetFirst);
      return;
    }
    const targetId = mode === "employee" ? selectedEmployeeId : selectedDepartmentId;
    if (targetId === null) return;
    const targetName =
      mode === "employee"
        ? selectedEmployee
          ? buildFullName(selectedEmployee.firstName, selectedEmployee.lastName)
          : "xodim"
        : (selectedDepartment?.name ?? "departament");

    download.mutate(
      { mode, targetId, targetName, from, to },
      {
        onSuccess: () => message.success(strings.reports.downloadSuccess),
        onError: () => message.error(strings.reports.downloadError),
      },
    );
  }, [
    canDownload,
    from,
    to,
    mode,
    selectedEmployeeId,
    selectedDepartmentId,
    selectedEmployee,
    selectedDepartment,
    download,
    message,
  ]);

  const handleModeChange = useCallback((nextMode: ReportMode) => {
    setMode(nextMode);
    setSelectedEmployeeId(null);
    setSelectedDepartmentId(null);
  }, []);

  return (
    <div className="reports-page">
      <PageHeader title={strings.reports.pageTitle} subtitle={strings.reports.pageSubtitle} />

      <ReportFilterCard
        mode={mode}
        employees={employees}
        departments={departments}
        selectedEmployeeId={selectedEmployeeId}
        selectedDepartmentId={selectedDepartmentId}
        fromDate={fromDate}
        toDate={toDate}
        isEmployeesLoading={employeesQuery.isLoading}
        isDepartmentsLoading={departmentsQuery.isLoading}
        isDownloading={download.isPending}
        canDownload={canDownload}
        onModeChange={handleModeChange}
        onEmployeeChange={setSelectedEmployeeId}
        onDepartmentChange={setSelectedDepartmentId}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onDownload={handleDownload}
      />

      {preview.isPartial && (
        <Alert
          type="warning"
          showIcon
          message={strings.reports.previewPartial}
          className="reports-page__notice"
        />
      )}

      <section className="reports-page__preview">
        <h2 className="reports-page__preview-title">{strings.reports.previewTitle}</h2>
        <ReportPreviewTable
          rows={preview.rows}
          isLoading={preview.isLoading}
          isError={preview.isError}
          isReady={preview.isReady}
          onRetry={() => void employeesQuery.refetch()}
        />
      </section>
    </div>
  );
}
