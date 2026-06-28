import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "@/features/auth/hooks/useAuth";

// Đích đến sau khi đã đăng nhập: admin về trang quản trị, hồ sơ thiếu (thường là
// tài khoản Google mới) về trang hoàn tất hồ sơ, còn lại về nơi định tới / trang chủ.
const resolveDestination = (user, from) => {
  if (user?.role === "admin") return "/admin";
  if (user && (!user.phone || !user.dateOfBirth)) return "/complete-profile";
  return from || "/";
};

const GuestRoute = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to={resolveDestination(user, location.state?.from)} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
