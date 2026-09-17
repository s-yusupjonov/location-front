import { useEffect } from "react";
import { Form, Input, InputNumber, Modal, Select } from "antd";
import { strings } from "@/shared/strings";

export interface ReferenceFormField {
  name: string;
  label: string;
  type: "text" | "number" | "select";
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: number; label: string }>;
}

interface ReferenceFormModalProps<TValues extends object> {
  open: boolean;
  title: string;
  fields: ReferenceFormField[];
  initialValues: TValues;
  isSubmitting: boolean;
  onSubmit: (values: TValues) => void;
  onCancel: () => void;
}

export function ReferenceFormModal<TValues extends object>({
  open,
  title,
  fields,
  initialValues,
  isSubmitting,
  onSubmit,
  onCancel,
}: ReferenceFormModalProps<TValues>) {
  const [form] = Form.useForm<TValues>();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue(initialValues);
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={strings.referenceData.save}
      cancelText={strings.referenceData.cancel}
      confirmLoading={isSubmitting}
      destroyOnClose
    >
      <Form<TValues>
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onSubmit}
        requiredMark={false}
      >
        {fields.map((field) => (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={
              field.required
                ? [{ required: true, message: strings.referenceData.required }]
                : undefined
            }
          >
            {field.type === "select" ? (
              <Select
                placeholder={field.placeholder}
                options={field.options ?? []}
                showSearch
                optionFilterProp="label"
              />
            ) : field.type === "number" ? (
              <InputNumber style={{ width: "100%" }} placeholder={field.placeholder} />
            ) : (
              <Input placeholder={field.placeholder} />
            )}
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
}
