import { useCallback, useMemo, useState } from "react";
import { App, Alert } from "antd";
import { strings } from "@/shared/strings";
import { PageHeader } from "@/shared/components/PageHeader";
import { useRegions } from "@/features/reference-data/hooks/useRegions";
import { useDistricts } from "@/features/reference-data/hooks/useDistricts";
import { useDepartments } from "@/features/reference-data/hooks/useDepartments";
import { usePositions } from "@/features/reference-data/hooks/usePositions";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useEmployeeFuzzySearch } from "@/features/employees/hooks/useEmployeeFuzzySearch";
import { useEmployeeAssignment } from "@/features/employees/hooks/useEmployeeAssignment";
import { useEmployeeDeactivation } from "@/features/employees/hooks/useEmployeeDeactivation";
import { EmployeesFilters } from "./EmployeesFilters";
import { EmployeesTable } from "./EmployeesTable";
import { AssignmentModal } from "./AssignmentModal";
import type { EmployeeDto } from "@/shared/types/api";
import "./EmployeesPage.css";

export function EmployeesPage() {
  const { message, modal } = App.useApp();
  const [regionId, setRegionId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [assigningEmployee, setAssigningEmployee] = useState<EmployeeDto | null>(null);

  const regionsQuery = useRegions();
  const districtsQuery = useDistricts(regionId);
  const departmentsQuery = useDepartments();
  const positionsQuery = usePositions();

  const filters = useMemo(
    () => ({ regionId, districtId, departmentId }),
    [regionId, districtId, departmentId],
  );
  const employeesQuery = useEmployees(filters);
  const employees = useMemo(() => employeesQuery.data ?? [], [employeesQuery.data]);
  const filteredEmployees = useEmployeeFuzzySearch(employees, searchQuery);

  const assignment = useEmployeeAssignment();
  const deactivation = useEmployeeDeactivation();

  const regionNameById = useMemo(
    () => new Map((regionsQuery.data ?? []).map((region) => [region.id, region.name])),
    [regionsQuery.data],
  );
  const districtNameById = useMemo(
    () => new Map((districtsQuery.data ?? []).map((district) => [district.id, district.name])),
    [districtsQuery.data],
  );
  const departmentNameById = useMemo(
    () =>
      new Map((departmentsQuery.data ?? []).map((department) => [department.id, department.name])),
    [departmentsQuery.data],
  );
  const positionNameById = useMemo(
    () => new Map((positionsQuery.data ?? []).map((position) => [position.id, position.name])),
    [positionsQuery.data],
  );

  const handleRegionChange = useCallback((value: number | null) => {
    setRegionId(value);
    setDistrictId(null);
  }, []);

  const handleReset = useCallback(() => {
    setRegionId(null);
    setDistrictId(null);
    setDepartmentId(null);
    setSearchQuery("");
  }, []);

  const handleAssignSubmit = useCallback(
    (values: { departmentId: number; positionId: number }) => {
      if (!assigningEmployee) return;
      assignment.mutate(
        {
          employeeId: assigningEmployee.id,
          payload: { departmentId: values.departmentId, positionId: values.positionId },
        },
        {
          onSuccess: () => {
            message.success(strings.employees.assignSuccess);
            setAssigningEmployee(null);
          },
          onError: () => message.error(strings.employees.assignError),
        },
      );
    },
    [assignment, assigningEmployee, message],
  );

  const handleDeactivate = useCallback(
    (employee: EmployeeDto) => {
      modal.confirm({
        title: strings.employees.deactivateTitle,
        content: strings.employees.deactivateConfirm,
        okText: strings.employees.deactivateOk,
        cancelText: strings.employees.deactivateCancel,
        okButtonProps: { danger: true },
        onOk: () =>
          new Promise<void>((resolve) => {
            deactivation.mutate(employee.id, {
              onSuccess: () => {
                message.success(strings.employees.deactivateSuccess);
                resolve();
              },
              onError: () => {
                message.error(strings.employees.deactivateError);
                resolve();
              },
            });
          }),
      });
    },
    [deactivation, message, modal],
  );

  return (
    <div className="employees-page">
      <PageHeader
        title={strings.employees.pageTitle}
        subtitle={strings.employees.pageSubtitle}
      />

      <Alert
        type="info"
        showIcon
        message={strings.employees.readOnlyNotice}
        className="employees-page__notice"
      />

      <EmployeesFilters
        regions={regionsQuery.data ?? []}
        districts={districtsQuery.data ?? []}
        departments={departmentsQuery.data ?? []}
        regionId={regionId}
        districtId={districtId}
        departmentId={departmentId}
        searchQuery={searchQuery}
        isRegionsLoading={regionsQuery.isLoading}
        isDistrictsLoading={districtsQuery.isLoading}
        isDepartmentsLoading={departmentsQuery.isLoading}
        onRegionChange={handleRegionChange}
        onDistrictChange={setDistrictId}
        onDepartmentChange={setDepartmentId}
        onSearchChange={setSearchQuery}
        onReset={handleReset}
      />

      <div className="employees-page__table">
        <EmployeesTable
          employees={filteredEmployees}
          isLoading={employeesQuery.isLoading}
          isError={employeesQuery.isError}
          isSearchActive={searchQuery.trim().length > 0 && employees.length > 0}
          isMutating={assignment.isPending || deactivation.isPending}
          regionNameById={regionNameById}
          districtNameById={districtNameById}
          departmentNameById={departmentNameById}
          positionNameById={positionNameById}
          onRetry={() => void employeesQuery.refetch()}
          onAssign={setAssigningEmployee}
          onDeactivate={handleDeactivate}
        />
      </div>

      <AssignmentModal
        employee={assigningEmployee}
        departments={departmentsQuery.data ?? []}
        positions={positionsQuery.data ?? []}
        isDepartmentsLoading={departmentsQuery.isLoading}
        isPositionsLoading={positionsQuery.isLoading}
        isSubmitting={assignment.isPending}
        onSubmit={handleAssignSubmit}
        onCancel={() => setAssigningEmployee(null)}
      />
    </div>
  );
}
