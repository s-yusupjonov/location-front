import { useMutation } from "@tanstack/react-query";
import {
  downloadDepartmentReport,
  downloadEmployeeReport,
} from "@/features/reports/api/reportsApi";
import { sanitizeFileNamePart, saveBlobAsFile } from "@/shared/utils/download";
import type { ReportMode } from "@/shared/types/ui";

interface DownloadVariables {
  mode: ReportMode;
  targetId: number;
  targetName: string;
  from: string;
  to: string;
}

function buildFileName(variables: DownloadVariables): string {
  const prefix = variables.mode === "employee" ? "xodim" : "departament";
  const name = sanitizeFileNamePart(variables.targetName);
  const from = sanitizeFileNamePart(variables.from);
  const to = sanitizeFileNamePart(variables.to);
  return `${prefix}-${name}-${from}-${to}.xlsx`;
}

export function useReportDownload() {
  return useMutation({
    mutationFn: async (variables: DownloadVariables) => {
      const blob =
        variables.mode === "employee"
          ? await downloadEmployeeReport(variables.targetId, variables.from, variables.to)
          : await downloadDepartmentReport(variables.targetId, variables.from, variables.to);
      saveBlobAsFile(blob, buildFileName(variables));
    },
  });
}
