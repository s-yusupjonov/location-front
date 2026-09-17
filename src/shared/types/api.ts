export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegionDto {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
}

export interface RegionPayload {
  name: string;
  latitude?: number;
  longitude?: number;
}

export interface DistrictDto {
  id: number;
  name: string;
  regionId: number;
}

export interface DistrictPayload {
  name: string;
  regionId: number;
}

export interface DepartmentDto {
  id: number;
  name: string;
}

export interface DepartmentPayload {
  name: string;
}

export interface PositionDto {
  id: number;
  name: string;
}

export interface PositionPayload {
  name: string;
}

export interface EmployeeDto {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  department: string;
  position: string;
  regionId: number;
  regionName?: string;
  districtId?: number;
  districtName?: string;
  departmentId?: number;
  positionId?: number;
  active?: boolean;
}

export interface EmployeeAssignmentPayload {
  departmentId: number;
  positionId: number;
}

export interface EmployeeFilters {
  regionId: number | null;
  districtId: number | null;
  departmentId: number | null;
}

export interface CurrentLocationDto {
  employeeId: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  address?: string;
}

export interface RoutePointDto {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface StopDto {
  id: number;
  latitude: number;
  longitude: number;
  address?: string;
  arrivalTime: string;
  departureTime: string | null;
  durationMinutes: number;
}

export interface LiveLocationMessage {
  employeeId: number;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface ApiErrorShape {
  message?: string;
  status?: number;
}
