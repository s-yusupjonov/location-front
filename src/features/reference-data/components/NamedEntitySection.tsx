import { useMemo, useState } from "react";
import { App, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { strings } from "@/shared/strings";
import { ReferenceTable } from "./ReferenceTable";
import { ReferenceFormModal, type ReferenceFormField } from "./ReferenceFormModal";
import type { ReferenceEntity } from "@/shared/types/ui";
import "./ReferenceSection.css";

interface NamedEntityFormValues {
  name: string;
}

interface NamedEntitySectionProps {
  items: ReferenceEntity[];
  isLoading: boolean;
  isError: boolean;
  isSubmitting: boolean;
  isMutating: boolean;
  addTitle: string;
  editTitle: string;
  emptyMessage: string;
  onRetry: () => void;
  onCreate: (name: string) => Promise<unknown>;
  onUpdate: (entity: ReferenceEntity) => Promise<unknown>;
  onDelete: (id: number) => Promise<unknown>;
}

const fields: ReferenceFormField[] = [
  {
    name: "name",
    label: strings.referenceData.nameLabel,
    type: "text",
    required: true,
    placeholder: strings.referenceData.namePlaceholder,
  },
];

const columns: ColumnsType<ReferenceEntity> = [
  { title: strings.referenceData.columnName, dataIndex: "name", key: "name" },
];

export function NamedEntitySection({
  items,
  isLoading,
  isError,
  isSubmitting,
  isMutating,
  addTitle,
  editTitle,
  emptyMessage,
  onRetry,
  onCreate,
  onUpdate,
  onDelete,
}: NamedEntitySectionProps) {
  const { message, modal } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<ReferenceEntity | null>(null);

  const initialValues = useMemo<NamedEntityFormValues>(
    () => ({ name: editingEntity?.name ?? "" }),
    [editingEntity],
  );

  const handleSubmit = async (values: NamedEntityFormValues) => {
    try {
      if (editingEntity) {
        await onUpdate({ ...editingEntity, name: values.name });
        message.success(strings.referenceData.updateSuccess);
      } else {
        await onCreate(values.name);
        message.success(strings.referenceData.createSuccess);
      }
      setIsModalOpen(false);
    } catch {
      message.error(strings.referenceData.mutationError);
    }
  };

  const handleDelete = (entity: ReferenceEntity) => {
    modal.confirm({
      title: strings.referenceData.deleteTitle,
      content: strings.referenceData.deleteConfirm,
      okText: strings.referenceData.remove,
      cancelText: strings.referenceData.cancel,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await onDelete(entity.id);
          message.success(strings.referenceData.deleteSuccess);
        } catch {
          message.error(strings.referenceData.mutationError);
        }
      },
    });
  };

  return (
    <div className="reference-section">
      <div className="reference-section__toolbar">
        <Button
          type="primary"
          onClick={() => {
            setEditingEntity(null);
            setIsModalOpen(true);
          }}
        >
          {strings.referenceData.add}
        </Button>
      </div>

      <ReferenceTable<ReferenceEntity>
        items={items}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={onRetry}
        onEdit={(entity) => {
          setEditingEntity(entity);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
        emptyMessage={emptyMessage}
        isMutating={isMutating}
      />

      <ReferenceFormModal<NamedEntityFormValues>
        open={isModalOpen}
        title={editingEntity ? editTitle : addTitle}
        fields={fields}
        initialValues={initialValues}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}
