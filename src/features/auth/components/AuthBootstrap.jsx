import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

import { getUserInfoThunk } from "@/features/auth/store/authThunks";
import {
  fetchNotificationsThunk,
  refreshUnreadCountThunk,
} from "@/features/notifications/store/notificationThunks";
import { clearNotifications } from "@/features/notifications/store/notificationSlice";
import tokenStorage from "@/utils/tokenStorage";

// Chu kỳ làm tươi số thông báo chưa đọc (ms) — để chuông cập nhật gần realtime, không cần reload.
const NOTIFICATION_POLL_MS = 30000;

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
    }
    prevUserIdRef.current = userId || null;
  }, [dispatch, userId, isAuthenticated]);

  // Khi đã đăng nhập: định kỳ làm tươi số thông báo chưa đọc + làm tươi ngay khi tab được focus lại.
  // Giúp chuông thông báo cập nhật mà không cần tải lại trang.
  useEffect(() => {
    if (!isAuthenticated || !userId) return undefined;

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
        <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
      </div>
    );
  }

  return children;
};

export default AuthBootstrap;
