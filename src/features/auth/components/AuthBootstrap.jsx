import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

import { restoreSessionThunk } from "@/features/auth/store/authThunks";
import {
  fetchNotificationsThunk,
  refreshUnreadCountThunk,
} from "@/features/notifications/store/notificationThunks";
import { clearNotifications } from "@/features/notifications/store/notificationSlice";
import { clearAdminNotifications } from "@/admin/store/adminNotificationSlice";
import { clearCredentials } from "@/features/auth/store/authSlice";
import tokenStorage from "@/utils/tokenStorage";

// Chu kỳ làm tươi số thông báo chưa đọc (ms) — để chuông cập nhật gần realtime, không cần reload.
const NOTIFICATION_POLL_MS = 30000;

// Khôi phục phiên đăng nhập khi mở app và đồng bộ thông báo theo tài khoản hiện tại.
const AuthBootstrap = ({ children }) => {
  const dispatch = useDispatch();
  const initialized = useSelector((state) => state.auth.initialized);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userId = useSelector((state) => state.auth.user?.id);
  const bootstrapStartedRef = useRef(false);
  const prevUserIdRef = useRef(null);

  useEffect(() => {
    // Đồng bộ đăng nhập/đăng xuất giữa các tab mà không truyền access token.
    const unsubscribe = tokenStorage.subscribe((event) => {
      if (event === "session-changed") dispatch(restoreSessionThunk());
      if (event === "session-ended") dispatch(clearCredentials());
    });

    // React StrictMode chạy effect hai lần ở dev; ref giữ bootstrap chỉ gọi một lần.
    if (!bootstrapStartedRef.current) {
      bootstrapStartedRef.current = true;
      dispatch(restoreSessionThunk());
    }

    return unsubscribe;
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

  if (!initialized) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return children;
};

export default AuthBootstrap;
