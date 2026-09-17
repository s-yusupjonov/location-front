import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  fetchPreviewSource,
  sortPreviewRows,
  toPreviewRows,
} from "@/features/reports/api/reportPreviewAdapter";
import { reportKeys } from "@/shared/api/queryKeys";
import { buildDateRange } from "@/shared/utils/format";
import type { EmployeeDto } from "@/shared/types/api";
import type { ReportPreviewResult, ReportPreviewRow } from "@/shared/types/ui";

const MAX_PREVIEW_DAYS = 31;
const MAX_PREVIEW_REQUESTS = 150;

interface PreviewPair {
  employee: EmployeeDto;
  date: string;
}

export function useReportPreview(
  employees: EmployeeDto[],
  from: string | null,
  to: string | null,
): ReportPreviewResult {
  const dates = useMemo(
    () => (from && to ? buildDateRange(from, to, MAX_PREVIEW_DAYS) : []),
    [from, to],
  );

  const { pairs, isPartial } = useMemo(() => {
    const allPairs: PreviewPair[] = [];
    for (const employee of employees) {
      for (const date of dates) {
        allPairs.push({ employee, date });
      }
    }
    const truncated = allPairs.length > MAX_PREVIEW_REQUESTS;
    return {
      pairs: truncated ? allPairs.slice(0, MAX_PREVIEW_REQUESTS) : allPairs,
      isPartial: truncated,
    };
  }, [employees, dates]);

  const results = useQueries({
    queries: pairs.map((pair) => ({
      queryKey: reportKeys.preview(pair.employee.id, pair.date),
      queryFn: () => fetchPreviewSource(pair.employee.id, pair.date),
      staleTime: 5 * 60 * 1000,
      retry: 1,
    })),
  });

  const rows = useMemo<ReportPreviewRow[]>(() => {
    const collected: ReportPreviewRow[] = [];
    pairs.forEach((pair, index) => {
      const stops = results[index]?.data;
      if (stops) {
        collected.push(...toPreviewRows(pair.employee, pair.date, stops));
      }
    });
    return sortPreviewRows(collected);
  }, [pairs, results]);

  return {
    rows,
    isLoading: results.some((result) => result.isLoading),
    isError: results.length > 0 && results.every((result) => result.isError),
    isPartial,
    isReady: pairs.length > 0,
  };
}
