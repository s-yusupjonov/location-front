import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App as AntdApp, ConfigProvider } from "antd";
import uzUZ from "antd/locale/uz_UZ";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { agrobankTheme } from "./theme";
import { router } from "./router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <ConfigProvider theme={agrobankTheme} locale={uzUZ}>
      <AntdApp>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </QueryClientProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
