import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { LoginPage } from "@/features/auth/components/LoginPage";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { PublicOnlyRoute } from "@/features/auth/components/PublicOnlyRoute";
import { MonitoringPage } from "@/features/monitoring/components/MonitoringPage";
import { EmployeesPage } from "@/features/employees/components/EmployeesPage";
import { ReferenceDataPage } from "@/features/reference-data/components/ReferenceDataPage";
import { ReportsPage } from "@/features/reports/components/ReportsPage";

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/monitoring", element: <MonitoringPage /> },
          { path: "/employees", element: <EmployeesPage /> },
          { path: "/reference-data", element: <ReferenceDataPage /> },
          { path: "/reports", element: <ReportsPage /> },
        ],
      },
    ],
  },
  { path: "/", element: <Navigate to="/monitoring" replace /> },
  { path: "*", element: <Navigate to="/monitoring" replace /> },
]);
