import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

import { getUserInfoThunk } from "@/features/auth/store/authThunks";
import {
  fetchNotificationsThunk,
  refreshUnreadCountThunk,
} from "@/features/notifications/store/notificationThunks";
import { clearNotifications } from "@/features/notifications/store/notificationSlice";
import { clearAdminNotifications } from "@/admin/store/adminNotificationSlice";
import tokenStorage from "@/utils/tokenStorage";

// Chu kỳ làm tươi số thông báo chưa đọc (ms) — để chuông cập nhật gần realtime, không cần reload.
const NOTIFICATION_POLL_MS = 30000;

// Khôi phục phiên đăng nhập khi mở app và đồng bộ thông báo theo tài khoản hiện tại.
const AuthBootstrap = ({ children }) => {
  const dispatch = useDispatch();
  const initialized = useSelector((state) => state.auth.initialized);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userId = useSelector((state) => state.auth.user?.id);
  // Không có token → không cần khôi phục phiên, sẵn sàng ngay (tính ở initializer để
  // tránh setState đồng bộ trong effect gây cascading render).
  const [ready, setReady] = useState(() => !tokenStorage.get());
  const prevUserIdRef = useRef(null);

  useEffect(() => {
    const token = tokenStorage.get();
    if (token) {
      dispatch(getUserInfoThunk()).finally(() => setReady(true));
    }
  }, [dispatch]);

  useEffect(() => {
    if (userId && userId !== prevUserIdRef.current) {
      dispatch(fetchNotificationsThunk());
    } else if (!isAuthenticated && prevUserIdRef.current) {
      dispatch(clearNotifications());
      dispatch(clearAdminNotifications());
    }
    prevUserIdRef.current = userId || null;
  }, [dispatch, userId, isAuthenticated]);

  // Làm tươi số thông báo chưa đọc theo chu kỳ và mỗi khi tab được xem lại.
  useEffect(() => {
    if (!isAuthenticated || !userId) return undefined;

    // Chỉ gọi API khi tab đang hiển thị.
    const refresh = () => {
      if (document.visibilityState === "visible") dispatch(refreshUnreadCountThunk());
    };

    const intervalId = setInterval(refresh, NOTIFICATION_POLL_MS);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [dispatch, isAuthenticated, userId]);

  if (!ready && !initialized) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return children;
};

export default AuthBootstrap;
