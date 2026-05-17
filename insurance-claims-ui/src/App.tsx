import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
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

        {/* Claims — todos los roles */}
        <Route path="claims" element={<ClaimsList />} />
        <Route path="claims/:id" element={<ClaimDetail />} />

        {/* New Claim — solo Admin y Agent */}
        <Route path="claims/new" element={
          <RoleRoute roles={["Admin", "Agent"]}>
            <ClaimForm />
          </RoleRoute>
        } />

        {/* Profile — todos los roles */}
        <Route path="profile" element={<Profile />} />

        {/* Placeholders para fases siguientes */}
        <Route path="users" element={
          <RoleRoute roles={["Admin"]}>
            <UsersList />
          </RoleRoute>
        } />
        <Route path="policies" element={
          <RoleRoute roles={["Admin", "Agent"]}>
            <PoliciesList />
          </RoleRoute>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}