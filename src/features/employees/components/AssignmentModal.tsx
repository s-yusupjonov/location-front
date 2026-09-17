import { useEffect } from "react";
import { Form, Modal, Select } from "antd";
import { strings } from "@/shared/strings";
import { buildFullName } from "@/shared/utils/format";
import type { DepartmentDto, EmployeeDto, PositionDto } from "@/shared/types/api";

interface AssignmentFormValues {
  departmentId: number;
  positionId: number;
}

interface AssignmentModalProps {
  employee: EmployeeDto | null;
  departments: DepartmentDto[];
  positions: PositionDto[];
  isDepartmentsLoading: boolean;
  isPositionsLoading: boolean;
  isSubmitting: boolean;
  onSubmit: (values: AssignmentFormValues) => void;
  onCancel: () => void;
}

export function AssignmentModal({
  employee,
  departments,
  positions,
  isDepartmentsLoading,
  isPositionsLoading,
  isSubmitting,
  onSubmit,
  onCancel,
}: AssignmentModalProps) {
  const [form] = Form.useForm<AssignmentFormValues>();

  useEffect(() => {
    if (employee) {
      form.resetFields();
      form.setFieldsValue({
        departmentId: employee.departmentId as number,
        positionId: employee.positionId as number,
      });
    }
  }, [employee, form]);

  return (
    <Modal
      open={employee !== null}
      title={
        employee
          ? `${strings.employees.assignModalTitle} — ${buildFullName(employee.firstName, employee.lastName)}`
          : strings.employees.assignModalTitle
      }
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={strings.common.save}
      cancelText={strings.common.cancel}
      confirmLoading={isSubmitting}
      destroyOnClose
    >
      <Form<AssignmentFormValues>
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="departmentId"
          label={strings.employees.assignDepartment}
          rules={[{ required: true, message: strings.employees.assignRequired }]}
        >
          <Select
            placeholder={strings.employees.assignDepartmentPlaceholder}
            loading={isDepartmentsLoading}
            showSearch
            optionFilterProp="label"
            options={departments.map((department) => ({
              value: department.id,
              label: department.name,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="positionId"
          label={strings.employees.assignPosition}
          rules={[{ required: true, message: strings.employees.assignRequired }]}
        >
          <Select
            placeholder={strings.employees.assignPositionPlaceholder}
            loading={isPositionsLoading}
            showSearch
            optionFilterProp="label"
            options={positions.map((position) => ({
              value: position.id,
              label: position.name,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
