import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getToken, setToken, clearToken } from "@/features/auth/api/tokenStorage";
import { loginRequest } from "@/features/auth/api/authApi";
import { setUnauthorizedHandler } from "@/shared/api/httpClient";
import type { LoginRequest } from "@/shared/types/api";

interface AuthContextValue {
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    setIsAuthenticated(Boolean(getToken()));
    setIsInitializing(false);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => logout());
  }, [logout]);

  const login = useCallback(async (payload: LoginRequest) => {
    const response = await loginRequest(payload);
    setToken(response.token);
    setIsAuthenticated(true);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, isInitializing, login, logout }),
    [isAuthenticated, isInitializing, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
