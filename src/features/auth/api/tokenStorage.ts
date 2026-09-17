const TOKEN_KEY = "agrobank_auth_token";

let inMemoryToken: string | null = null;

export function getToken(): string | null {
  if (inMemoryToken) return inMemoryToken;
  inMemoryToken = sessionStorage.getItem(TOKEN_KEY);
  return inMemoryToken;
}

export function setToken(token: string): void {
  inMemoryToken = token;
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  inMemoryToken = null;
  sessionStorage.removeItem(TOKEN_KEY);
}
