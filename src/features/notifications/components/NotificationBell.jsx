import { Bell } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import { selectUnreadCount } from "@/features/notifications/store/notificationSlice";

// Chuông thông báo trên Header kèm badge số chưa đọc.
const NotificationBell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = useSelector(selectUnreadCount);
  const isActive = location.pathname === "/notifications";

  return (
    <button
      type="button"
      onClick={() => navigate("/notifications")}
      aria-current={isActive ? "page" : undefined}
      className={`relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors ${
        isActive ? "bg-brand/10 text-brand" : "text-slate-600 hover:bg-slate-100"
      }`}
      aria-label="Thông báo"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
