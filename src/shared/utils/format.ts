import dayjs from "dayjs";
import { strings } from "@/shared/strings";

export const DATE_FORMAT = "YYYY-MM-DD";
export const TIME_FORMAT = "HH:mm";

export function formatDate(value: string | null | undefined): string {
  if (!value) return strings.common.noData;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(DATE_FORMAT) : strings.common.noData;
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return strings.common.noData;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(TIME_FORMAT) : strings.common.noData;
}

export function formatDuration(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
    return `0 ${strings.common.minutes}`;
  }
  const rounded = Math.round(totalMinutes);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  if (hours === 0) return `${minutes} ${strings.common.minutes}`;
  if (minutes === 0) return `${hours} ${strings.common.hours}`;
  return `${hours} ${strings.common.hours} ${minutes} ${strings.common.minutes}`;
}

export function buildFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function buildDateRange(from: string, to: string, maxDays: number): string[] {
  const start = dayjs(from, DATE_FORMAT);
  const end = dayjs(to, DATE_FORMAT);
  if (!start.isValid() || !end.isValid() || end.isBefore(start, "day")) return [];
  const dates: string[] = [];
  let cursor = start;
  while (!cursor.isAfter(end, "day") && dates.length < maxDays) {
    dates.push(cursor.format(DATE_FORMAT));
    cursor = cursor.add(1, "day");
  }
  return dates;
}
