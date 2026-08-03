import { Bell } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import { selectAdminUnreadCount } from "@/admin/store/adminNotificationSlice";

// Chuông thông báo riêng của khu quản trị — chỉ hiển thị thông báo nghiệp vụ dành cho admin
// (audience="admin"), tách biệt với chuông thông báo phía người dùng ở Header.
const AdminNotificationBell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = useSelector(selectAdminUnreadCount);
  const isActive = location.pathname === "/admin/notifications";

  return (
    <button
      type="button"
      onClick={() => navigate("/admin/notifications")}
      aria-current={isActive ? "page" : undefined}
      className={`relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors ${
        isActive ? "bg-brand/10 text-brand" : "text-slate-600 hover:bg-slate-100"
      }`}
      aria-label="Thông báo quản trị"
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

export default AdminNotificationBell;
