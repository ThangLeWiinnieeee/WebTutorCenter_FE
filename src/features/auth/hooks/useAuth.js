import { useSelector, useDispatch } from "react-redux";
import { clearError } from "@/features/auth/store/authSlice";
import { logoutThunk } from "@/features/auth/store/authThunks";

// Hook truy cập nhanh state auth kèm hành động đăng xuất và xóa lỗi.
const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  // Đăng xuất khỏi phiên hiện tại.
  const logout = () => dispatch(logoutThunk());
  // Xóa thông báo lỗi đang lưu trong store auth.
  const clearAuthError = () => dispatch(clearError());

  return { user, isAuthenticated, loading, error, logout, clearAuthError };
};

export default useAuth;
