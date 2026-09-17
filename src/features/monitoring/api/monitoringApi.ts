import { httpClient } from "@/shared/api/httpClient";
import type {
  CurrentLocationDto,
  RoutePointDto,
  StopDto,
} from "@/shared/types/api";

export async function fetchCurrentLocation(employeeId: number): Promise<CurrentLocationDto> {
  const response = await httpClient.get<CurrentLocationDto>(
    `/api/employees/${employeeId}/current-location`,
  );
  return response.data;
}

interface RoutePointRaw {
  id: number;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface RouteResponse {
  employeeId: number;
  date: string;
  points: RoutePointRaw[];
}

export async function fetchEmployeeRoute(employeeId: number, date: string): Promise<RoutePointDto[]> {
  const response = await httpClient.get<RouteResponse>(`/api/employees/${employeeId}/route`, {
    params: { date },
  });
  return response.data.points.map((point) => ({
    latitude: point.latitude,
    longitude: point.longitude,
    timestamp: new Date(point.timestamp).toISOString(),
  }));
}

export async function fetchEmployeeStops(employeeId: number, date: string): Promise<StopDto[]> {
  const response = await httpClient.get<StopDto[]>(`/api/employees/${employeeId}/stops`, {
    params: { date },
  });
  return response.data;
}