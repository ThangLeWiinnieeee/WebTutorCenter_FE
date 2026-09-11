import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@/features/auth/hooks/useAuth";

// Kiểm tra hồ sơ người dùng còn thiếu thông tin bắt buộc hay không.
const isProfileIncomplete = (user) => user && (!user.phone || !user.dateOfBirth);

// Route guard: yêu cầu đăng nhập, tùy chọn kiểm tra hồ sơ đầy đủ và vai trò cho phép.
const ProtectedRoute = ({ skipProfileCheck = false, allowedRoles = null }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!skipProfileCheck && isProfileIncomplete(user)) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
