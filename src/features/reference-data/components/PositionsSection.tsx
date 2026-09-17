import { strings } from "@/shared/strings";
import { usePositionMutations, usePositions } from "@/features/reference-data/hooks/usePositions";
import { NamedEntitySection } from "./NamedEntitySection";

export function PositionsSection() {
  const positionsQuery = usePositions();
  const { create, update, remove } = usePositionMutations();

  return (
    <NamedEntitySection
      items={positionsQuery.data ?? []}
      isLoading={positionsQuery.isLoading}
      isError={positionsQuery.isError}
      isSubmitting={create.isPending || update.isPending}
      isMutating={remove.isPending}
      addTitle={strings.referenceData.addPosition}
      editTitle={strings.referenceData.editPosition}
      emptyMessage={strings.referenceData.emptyPositions}
      onRetry={() => void positionsQuery.refetch()}
      onCreate={(name) => create.mutateAsync({ name })}
      onUpdate={(entity) => update.mutateAsync({ id: entity.id, name: entity.name })}
      onDelete={(id) => remove.mutateAsync(id)}
    />
  );
}
