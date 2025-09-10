/**
 * Node modules
 */
import { useAuthStore } from "@/store/auth";
import { Navigate, Outlet } from "react-router-dom";

/**
 * Stores
 */

export const GuestRoute = () => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};
