import { useMemo, useState } from "react";
import { App, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { strings } from "@/shared/strings";
import { useRegionMutations, useRegions } from "@/features/reference-data/hooks/useRegions";
import { ReferenceTable } from "./ReferenceTable";
import { ReferenceFormModal, type ReferenceFormField } from "./ReferenceFormModal";
import type { RegionDto } from "@/shared/types/api";
import "./ReferenceSection.css";

interface RegionFormValues {
  name: string;
  latitude?: number;
  longitude?: number;
}

const fields: ReferenceFormField[] = [
  {
    name: "name",
    label: strings.referenceData.nameLabel,
    type: "text",
    required: true,
    placeholder: strings.referenceData.namePlaceholder,
  },
  {
    name: "latitude",
    label: strings.referenceData.latitudeLabel,
    type: "number",
    required: false,
  },
  {
    name: "longitude",
    label: strings.referenceData.longitudeLabel,
    type: "number",
    required: false,
  },
];

export function RegionsSection() {
  const { message, modal } = App.useApp();
  const regionsQuery = useRegions();
  const { create, update, remove } = useRegionMutations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<RegionDto | null>(null);

  const initialValues = useMemo<RegionFormValues>(
    () => ({
      name: editingRegion?.name ?? "",
      latitude: editingRegion?.latitude,
      longitude: editingRegion?.longitude,
    }),
    [editingRegion],
  );

  const columns: ColumnsType<RegionDto> = [
    { title: strings.referenceData.columnName, dataIndex: "name", key: "name" },
    {
      title: strings.referenceData.columnLatitude,
      dataIndex: "latitude",
      key: "latitude",
      width: 140,
      render: (value: number | undefined) => value ?? strings.common.noData,
    },
    {
      title: strings.referenceData.columnLongitude,
      dataIndex: "longitude",
      key: "longitude",
      width: 140,
      render: (value: number | undefined) => value ?? strings.common.noData,
    },
  ];

  const handleSubmit = (values: RegionFormValues) => {
    const payload = {
      name: values.name,
      latitude: values.latitude,
      longitude: values.longitude,
    };
    if (editingRegion) {
      update.mutate(
        { ...editingRegion, ...payload },
        {
          onSuccess: () => {
            message.success(strings.referenceData.updateSuccess);
            setIsModalOpen(false);
          },
          onError: () => message.error(strings.referenceData.mutationError),
        },
      );
      return;
    }
    create.mutate(payload, {
      onSuccess: () => {
        message.success(strings.referenceData.createSuccess);
        setIsModalOpen(false);
      },
      onError: () => message.error(strings.referenceData.mutationError),
    });
  };

  const handleDelete = (region: RegionDto) => {
    modal.confirm({
      title: strings.referenceData.deleteTitle,
      content: strings.referenceData.deleteConfirm,
      okText: strings.referenceData.remove,
      cancelText: strings.referenceData.cancel,
      okButtonProps: { danger: true },
      onOk: () =>
        new Promise<void>((resolve) => {
          remove.mutate(region.id, {
            onSuccess: () => {
              message.success(strings.referenceData.deleteSuccess);
              resolve();
            },
            onError: () => {
              message.error(strings.referenceData.mutationError);
              resolve();
            },
          });
        }),
    });
  };

  return (
    <div className="reference-section">
      <div className="reference-section__toolbar">
        <Button
          type="primary"
          onClick={() => {
            setEditingRegion(null);
            setIsModalOpen(true);
          }}
        >
          {strings.referenceData.add}
        </Button>
      </div>

      <ReferenceTable<RegionDto>
        items={regionsQuery.data ?? []}
        columns={columns}
        isLoading={regionsQuery.isLoading}
        isError={regionsQuery.isError}
        onRetry={() => void regionsQuery.refetch()}
        onEdit={(region) => {
          setEditingRegion(region);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
        emptyMessage={strings.referenceData.emptyRegions}
        isMutating={remove.isPending}
      />

      <ReferenceFormModal<RegionFormValues>
        open={isModalOpen}
        title={editingRegion ? strings.referenceData.editRegion : strings.referenceData.addRegion}
        fields={fields}
        initialValues={initialValues}
        isSubmitting={create.isPending || update.isPending}
        onSubmit={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}
