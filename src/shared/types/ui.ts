import type { EmployeeDto } from "./api";

export interface EmployeeWithStatus extends EmployeeDto {
  isOnline: boolean;
  lastSeenAt: string | null;
  currentLatitude: number | null;
  currentLongitude: number | null;
}

export type EmployeeSelection = number | null;

export interface ReferenceEntity {
  id: number;
  name: string;
}

export type ReportMode = "employee" | "department";

export interface ReportPreviewRow {
  key: string;
  employeeName: string;
  date: string;
  arrivalTime: string;
  departureTime: string | null;
  durationMinutes: number;
  address: string | null;
  latitude: number;
  longitude: number;
}

export interface ReportPreviewResult {
  rows: ReportPreviewRow[];
  isLoading: boolean;
  isError: boolean;
  isPartial: boolean;
  isReady: boolean;
}
