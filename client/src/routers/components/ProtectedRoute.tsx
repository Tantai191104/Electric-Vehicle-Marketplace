import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";

interface ProtectedRouteProps {
  role?: "admin" | "user";
}

export const ProtectedRoute = ({ role }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    toast.error("Bạn cần đăng nhập để truy cập trang này.");
    return <Navigate to="/auth/login" replace />;
  }


  if (role && user?.role !== role) {
    toast.error("Bạn không có quyền truy cập trang này.");
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};
