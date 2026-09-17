import { Button, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { strings } from "@/shared/strings";
import type { ReferenceEntity } from "@/shared/types/ui";
import "./ReferenceTable.css";

interface ReferenceTableProps<TItem extends ReferenceEntity> {
  items: TItem[];
  columns: ColumnsType<TItem>;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onEdit: (item: TItem) => void;
  onDelete: (item: TItem) => void;
  emptyMessage: string;
  isMutating: boolean;
}

export function ReferenceTable<TItem extends ReferenceEntity>({
  items,
  columns,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onDelete,
  emptyMessage,
  isMutating,
}: ReferenceTableProps<TItem>) {
  if (isError) {
    return <ErrorState message={strings.referenceData.error} onRetry={onRetry} />;
  }

  const actionColumn: ColumnsType<TItem>[number] = {
    title: strings.referenceData.columnActions,
    key: "actions",
    width: 200,
    align: "right",
    render: (_value, record) => (
      <Space size={8}>
        <Button size="small" onClick={() => onEdit(record)} disabled={isMutating}>
          {strings.referenceData.edit}
        </Button>
        <Button size="small" danger onClick={() => onDelete(record)} disabled={isMutating}>
          {strings.referenceData.remove}
        </Button>
      </Space>
    ),
  };

  return (
    <Table<TItem>
      className="reference-table"
      rowKey={(record) => record.id}
      dataSource={items}
      columns={[...columns, actionColumn]}
      loading={isLoading}
      pagination={items.length > 10 ? { pageSize: 10, showSizeChanger: false } : false}
      locale={{ emptyText: isLoading ? " " : <EmptyState message={emptyMessage} /> }}
    />
  );
}
