import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "@/features/auth/hooks/useAuth";

// Chọn đích chuyển hướng cho người đã đăng nhập theo vai trò và độ đầy đủ hồ sơ.
const resolveDestination = (user, from) => {
  if (user?.role === "admin") return "/admin";
  if (user && (!user.phone || !user.dateOfBirth)) return "/complete-profile";
  return from || "/";
};

// Route guard: chặn người đã đăng nhập vào các trang dành cho khách.
const GuestRoute = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to={resolveDestination(user, location.state?.from)} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
