import { httpClient } from "@/shared/api/httpClient";
import type {
  DepartmentDto,
  DepartmentPayload,
  DistrictDto,
  DistrictPayload,
  PositionDto,
  PositionPayload,
  RegionDto,
  RegionPayload,
} from "@/shared/types/api";

export async function fetchRegions(): Promise<RegionDto[]> {
  const response = await httpClient.get<RegionDto[]>("/api/regions");
  return response.data;
}

export async function createRegion(payload: RegionPayload): Promise<RegionDto> {
  const response = await httpClient.post<RegionDto>("/api/regions", payload);
  return response.data;
}

export async function updateRegion(region: RegionDto): Promise<RegionDto> {
  const response = await httpClient.put<RegionDto>("/api/regions", region);
  return response.data;
}

export async function deleteRegion(id: number): Promise<void> {
  await httpClient.delete("/api/regions", { params: { id } });
}

export async function fetchDistricts(regionId: number): Promise<DistrictDto[]> {
  const response = await httpClient.get<DistrictDto[]>("/api/districts", {
    params: { regionId },
  });
  return response.data;
}

export async function createDistrict(payload: DistrictPayload): Promise<DistrictDto> {
  const response = await httpClient.post<DistrictDto>("/api/districts", payload);
  return response.data;
}

export async function updateDistrict(district: DistrictDto): Promise<DistrictDto> {
  const response = await httpClient.put<DistrictDto>("/api/districts", district);
  return response.data;
}

export async function deleteDistrict(id: number): Promise<void> {
  await httpClient.delete("/api/districts", { params: { id } });
}

export async function fetchDepartments(): Promise<DepartmentDto[]> {
  const response = await httpClient.get<DepartmentDto[]>("/api/departments");
  return response.data;
}

export async function createDepartment(payload: DepartmentPayload): Promise<DepartmentDto> {
  const response = await httpClient.post<DepartmentDto>("/api/departments", payload);
  return response.data;
}

export async function updateDepartment(department: DepartmentDto): Promise<DepartmentDto> {
  const response = await httpClient.put<DepartmentDto>("/api/departments", department);
  return response.data;
}

export async function deleteDepartment(id: number): Promise<void> {
  await httpClient.delete("/api/departments", { params: { id } });
}

export async function fetchPositions(): Promise<PositionDto[]> {
  const response = await httpClient.get<PositionDto[]>("/api/positions");
  return response.data;
}

export async function createPosition(payload: PositionPayload): Promise<PositionDto> {
  const response = await httpClient.post<PositionDto>("/api/positions", payload);
  return response.data;
}

export async function updatePosition(position: PositionDto): Promise<PositionDto> {
  const response = await httpClient.put<PositionDto>("/api/positions", position);
  return response.data;
}

export async function deletePosition(id: number): Promise<void> {
  await httpClient.delete("/api/positions", { params: { id } });
}
