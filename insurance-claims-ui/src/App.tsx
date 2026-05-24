import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import { ConfirmProvider } from "./components/ui/ConfirmModal";
import type { ReactNode } from "react";
import Login from "./pages/auth/Login";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/dashboard/Dashboard";
import ClaimsList from "./pages/claims/ClaimsList";
import ClaimDetail from "./pages/claims/ClaimDetail";
import ClaimForm from "./pages/claims/ClaimForm";
import Profile from "./pages/profile/Profile";
import UsersList from "./pages/users/UsersList";
import PoliciesList from "./pages/policies/PoliciesList";
import Reports from "./pages/reports/Reports";
import { ThemeProvider } from "./context/ThemeContext";


const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RoleRoute({ children, roles }: { children: ReactNode; roles: string[] }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="claims" element={<ClaimsList />} />
        <Route path="claims/:id" element={<ClaimDetail />} />
        <Route path="claims/new" element={
          <RoleRoute roles={["Admin", "Agent"]}><ClaimForm /></RoleRoute>
        } />
        <Route path="profile" element={<Profile />} />
        <Route path="reports" element={
          <RoleRoute roles={["Admin"]}><Reports /></RoleRoute>
        } />
        <Route path="users" element={
          <RoleRoute roles={["Admin"]}><UsersList /></RoleRoute>
        } />
        <Route path="policies" element={
          <RoleRoute roles={["Admin", "Agent"]}><PoliciesList /></RoleRoute>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ConfirmProvider>
            <AuthProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </AuthProvider>
          </ConfirmProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}