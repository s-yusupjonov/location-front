import { httpClient } from "@/shared/api/httpClient";
import type { LoginRequest, LoginResponse } from "@/shared/types/api";

export async function loginRequest(payload: LoginRequest): Promise<LoginResponse> {
  const response = await httpClient.post<LoginResponse>("/api/auth/login", payload);
  return response.data;
}
