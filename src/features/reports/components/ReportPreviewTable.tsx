import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { strings } from "@/shared/strings";
import { formatDate, formatDuration, formatTime } from "@/shared/utils/format";
import { buildMapUrl } from "@/shared/utils/download";
import type { ReportPreviewRow } from "@/shared/types/ui";
import "./ReportPreviewTable.css";

interface ReportPreviewTableProps {
  rows: ReportPreviewRow[];
  isLoading: boolean;
  isError: boolean;
  isReady: boolean;
  onRetry: () => void;
}

const columns: ColumnsType<ReportPreviewRow> = [
  {
    title: strings.reports.columnEmployee,
    dataIndex: "employeeName",
    key: "employeeName",
    width: 200,
  },
  {
    title: strings.reports.columnDate,
    dataIndex: "date",
    key: "date",
    width: 130,
    render: (value: string) => formatDate(value),
  },
  {
    title: strings.reports.columnArrival,
    dataIndex: "arrivalTime",
    key: "arrivalTime",
    width: 130,
    render: (value: string) => formatTime(value),
  },
  {
    title: strings.reports.columnDeparture,
    dataIndex: "departureTime",
    key: "departureTime",
    width: 160,
    render: (value: string | null) => (value ? formatTime(value) : strings.reports.stillHere),
  },
  {
    title: strings.reports.columnDuration,
    dataIndex: "durationMinutes",
    key: "durationMinutes",
    width: 160,
    render: (value: number) => formatDuration(value),
  },
  {
    title: strings.reports.columnAddress,
    key: "address",
    render: (_value, record) => (
      <a
        className="report-preview__address"
        href={buildMapUrl(record.latitude, record.longitude)}
        target="_blank"
        rel="noopener noreferrer"
        title={strings.reports.openOnMap}
      >
        {record.address ?? strings.reports.addressUnknown}
      </a>
    ),
  },
];

export function ReportPreviewTable({
  rows,
  isLoading,
  isError,
  isReady,
  onRetry,
}: ReportPreviewTableProps) {
  if (!isReady) {
    return (
      <EmptyState
        message={strings.reports.previewEmpty}
        hint={strings.reports.previewEmptyHint}
      />
    );
  }

  if (isError) {
    return <ErrorState message={strings.reports.previewError} onRetry={onRetry} />;
  }

  if (!isLoading && rows.length === 0) {
    return <EmptyState message={strings.reports.previewNoData} />;
  }

  return (
    <Table<ReportPreviewRow>
      className="report-preview"
      rowKey={(record) => record.key}
      dataSource={rows}
      columns={columns}
      loading={isLoading}
      scroll={{ x: 1000 }}
      pagination={rows.length > 20 ? { pageSize: 20, showSizeChanger: false } : false}
      locale={{ emptyText: isLoading ? " " : <EmptyState message={strings.reports.previewNoData} /> }}
    />
  );
}
