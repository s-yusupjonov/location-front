import { useEffect, useMemo, useState } from "react";
import { App, Button, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { strings } from "@/shared/strings";
import { useRegions } from "@/features/reference-data/hooks/useRegions";
import {
  useDistrictMutations,
  useDistricts,
} from "@/features/reference-data/hooks/useDistricts";
import { EmptyState } from "@/shared/components/EmptyState";
import { ReferenceTable } from "./ReferenceTable";
import { ReferenceFormModal, type ReferenceFormField } from "./ReferenceFormModal";
import type { DistrictDto } from "@/shared/types/api";
import "./ReferenceSection.css";

interface DistrictFormValues {
  name: string;
  regionId: number;
}

export function DistrictsSection() {
  const { message, modal } = App.useApp();
  const regionsQuery = useRegions();
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const districtsQuery = useDistricts(selectedRegionId);
  const { create, update, remove } = useDistrictMutations(selectedRegionId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<DistrictDto | null>(null);

  useEffect(() => {
    const regions = regionsQuery.data;
    if (selectedRegionId === null && regions && regions.length > 0) {
      const first = regions[0];
      if (first) setSelectedRegionId(first.id);
    }
  }, [regionsQuery.data, selectedRegionId]);

  const fields = useMemo<ReferenceFormField[]>(
    () => [
      {
        name: "name",
        label: strings.referenceData.nameLabel,
        type: "text",
        required: true,
        placeholder: strings.referenceData.namePlaceholder,
      },
      {
        name: "regionId",
        label: strings.referenceData.regionLabel,
        type: "select",
        required: true,
        placeholder: strings.referenceData.regionPlaceholder,
        options: (regionsQuery.data ?? []).map((region) => ({
          value: region.id,
          label: region.name,
        })),
      },
    ],
    [regionsQuery.data],
  );

  const initialValues = useMemo<DistrictFormValues>(
    () => ({
      name: editingDistrict?.name ?? "",
      regionId: editingDistrict?.regionId ?? (selectedRegionId ?? 0),
    }),
    [editingDistrict, selectedRegionId],
  );

  const columns: ColumnsType<DistrictDto> = [
    { title: strings.referenceData.columnName, dataIndex: "name", key: "name" },
  ];

  const handleSubmit = (values: DistrictFormValues) => {
    if (editingDistrict) {
      update.mutate(
        { ...editingDistrict, name: values.name, regionId: values.regionId },
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
    create.mutate(
      { name: values.name, regionId: values.regionId },
      {
        onSuccess: () => {
          message.success(strings.referenceData.createSuccess);
          setIsModalOpen(false);
        },
        onError: () => message.error(strings.referenceData.mutationError),
      },
    );
  };

  const handleDelete = (district: DistrictDto) => {
    modal.confirm({
      title: strings.referenceData.deleteTitle,
      content: strings.referenceData.deleteConfirm,
      okText: strings.referenceData.remove,
      cancelText: strings.referenceData.cancel,
      okButtonProps: { danger: true },
      onOk: () =>
        new Promise<void>((resolve) => {
          remove.mutate(district.id, {
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
        <div className="reference-section__field">
          <span className="reference-section__label">{strings.referenceData.regionLabel}</span>
          <Select
            value={selectedRegionId ?? undefined}
            onChange={setSelectedRegionId}
            placeholder={strings.referenceData.regionPlaceholder}
            loading={regionsQuery.isLoading}
            showSearch
            optionFilterProp="label"
            options={(regionsQuery.data ?? []).map((region) => ({
              value: region.id,
              label: region.name,
            }))}
          />
        </div>
        <Button
          type="primary"
          disabled={selectedRegionId === null}
          onClick={() => {
            setEditingDistrict(null);
            setIsModalOpen(true);
          }}
        >
          {strings.referenceData.add}
        </Button>
      </div>

      {selectedRegionId === null ? (
        <EmptyState message={strings.referenceData.selectRegionFirst} />
      ) : (
        <ReferenceTable<DistrictDto>
          items={districtsQuery.data ?? []}
          columns={columns}
          isLoading={districtsQuery.isLoading}
          isError={districtsQuery.isError}
          onRetry={() => void districtsQuery.refetch()}
          onEdit={(district) => {
            setEditingDistrict(district);
            setIsModalOpen(true);
          }}
          onDelete={handleDelete}
          emptyMessage={strings.referenceData.emptyDistricts}
          isMutating={remove.isPending}
        />
      )}

      <ReferenceFormModal<DistrictFormValues>
        open={isModalOpen}
        title={
          editingDistrict ? strings.referenceData.editDistrict : strings.referenceData.addDistrict
        }
        fields={fields}
        initialValues={initialValues}
        isSubmitting={create.isPending || update.isPending}
        onSubmit={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}
