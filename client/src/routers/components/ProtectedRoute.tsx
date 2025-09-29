/**
 * Node modules
 */
import { Navigate, Outlet } from "react-router-dom";

/**
 * Stores
 */
import { useAuthStore } from "@/store/auth";

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  return <Outlet />;
};
