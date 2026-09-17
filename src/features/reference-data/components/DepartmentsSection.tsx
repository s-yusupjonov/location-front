import { strings } from "@/shared/strings";
import {
  useDepartmentMutations,
  useDepartments,
} from "@/features/reference-data/hooks/useDepartments";
import { NamedEntitySection } from "./NamedEntitySection";

export function DepartmentsSection() {
  const departmentsQuery = useDepartments();
  const { create, update, remove } = useDepartmentMutations();

  return (
    <NamedEntitySection
      items={departmentsQuery.data ?? []}
      isLoading={departmentsQuery.isLoading}
      isError={departmentsQuery.isError}
      isSubmitting={create.isPending || update.isPending}
      isMutating={remove.isPending}
      addTitle={strings.referenceData.addDepartment}
      editTitle={strings.referenceData.editDepartment}
      emptyMessage={strings.referenceData.emptyDepartments}
      onRetry={() => void departmentsQuery.refetch()}
      onCreate={(name) => create.mutateAsync({ name })}
      onUpdate={(entity) => update.mutateAsync({ id: entity.id, name: entity.name })}
      onDelete={(id) => remove.mutateAsync(id)}
    />
  );
}
