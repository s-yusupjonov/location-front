import { Button, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { strings } from "@/shared/strings";
import { buildFullName } from "@/shared/utils/format";
import type { EmployeeDto } from "@/shared/types/api";
import "./EmployeesTable.css";

interface EmployeesTableProps {
  employees: EmployeeDto[];
  isLoading: boolean;
  isError: boolean;
  isSearchActive: boolean;
  isMutating: boolean;
  regionNameById: Map<number, string>;
  districtNameById: Map<number, string>;
  departmentNameById: Map<number, string>;
  positionNameById: Map<number, string>;
  onRetry: () => void;
  onAssign: (employee: EmployeeDto) => void;
  onDeactivate: (employee: EmployeeDto) => void;
}

export function EmployeesTable({
  employees,
  isLoading,
  isError,
  isSearchActive,
  isMutating,
  regionNameById,
  districtNameById,
  departmentNameById,
  positionNameById,
  onRetry,
  onAssign,
  onDeactivate,
}: EmployeesTableProps) {
  if (isError) {
    return <ErrorState message={strings.employees.error} onRetry={onRetry} />;
  }

  const columns: ColumnsType<EmployeeDto> = [
    {
      title: strings.employees.columnName,
      key: "name",
      render: (_value, record) => buildFullName(record.firstName, record.lastName),
    },
    {
      title: strings.employees.columnPhone,
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 160,
      render: (value: string | undefined) => value ?? strings.employees.unknown,
    },
    {
      title: strings.employees.columnRegion,
      key: "region",
      width: 160,
      render: (_value, record) =>
        record.regionName ?? regionNameById.get(record.regionId) ?? strings.employees.unknown,
    },
    {
      title: strings.employees.columnDistrict,
      key: "district",
      width: 160,
      render: (_value, record) =>
        record.districtName ??
        (record.districtId !== undefined ? districtNameById.get(record.districtId) : undefined) ??
        strings.employees.unknown,
    },
    {
      title: strings.employees.columnDepartment,
      key: "department",
      width: 180,
      render: (_value, record) =>
        record.department ??
        (record.departmentId !== undefined
          ? departmentNameById.get(record.departmentId)
          : undefined) ??
        strings.employees.notAssigned,
    },
    {
      title: strings.employees.columnPosition,
      key: "position",
      width: 180,
      render: (_value, record) =>
        record.position ??
        (record.positionId !== undefined ? positionNameById.get(record.positionId) : undefined) ??
        strings.employees.notAssigned,
    },
    {
      title: strings.employees.columnStatus,
      key: "status",
      width: 120,
      render: (_value, record) =>
        record.active === false ? (
          <Tag color="default">{strings.employees.statusInactive}</Tag>
        ) : (
          <Tag color="green">{strings.employees.statusActive}</Tag>
        ),
    },
    {
      title: strings.employees.columnActions,
      key: "actions",
      width: 260,
      align: "right",
      render: (_value, record) => (
        <Space size={8}>
          <Button size="small" type="primary" onClick={() => onAssign(record)} disabled={isMutating}>
            {strings.employees.assign}
          </Button>
          <Button
            size="small"
            danger
            onClick={() => onDeactivate(record)}
            disabled={isMutating || record.active === false}
          >
            {strings.employees.deactivate}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table<EmployeeDto>
      className="employees-table"
      rowKey={(record) => record.id}
      dataSource={employees}
      columns={columns}
      loading={isLoading}
      scroll={{ x: 1200 }}
      pagination={employees.length > 20 ? { pageSize: 20, showSizeChanger: false } : false}
      locale={{
        emptyText: isLoading ? (
          " "
        ) : (
          <EmptyState
            message={
              isSearchActive ? strings.employees.searchEmpty : strings.employees.empty
            }
            hint={isSearchActive ? undefined : strings.employees.emptyHint}
          />
        ),
      }}
    />
  );
}
