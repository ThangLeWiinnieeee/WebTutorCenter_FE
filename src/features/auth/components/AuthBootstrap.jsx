import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

import { getUserInfoThunk } from "@/features/auth/store/authThunks";
import { fetchNotificationsThunk } from "@/features/notifications/store/notificationThunks";
import { clearNotifications } from "@/features/notifications/store/notificationSlice";
import tokenStorage from "@/utils/tokenStorage";

const AuthBootstrap = ({ children }) => {
  const dispatch = useDispatch();
  const initialized = useSelector((state) => state.auth.initialized);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userId = useSelector((state) => state.auth.user?.id);
  const [ready, setReady] = useState(false);
  const prevUserIdRef = useRef(null);

  useEffect(() => {
    const token = tokenStorage.get();
    if (token) {
      dispatch(getUserInfoThunk()).finally(() => setReady(true));
    } else {
      setReady(true);
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
