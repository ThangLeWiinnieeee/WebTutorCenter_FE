import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectNotifications,
  selectUnreadCount,
} from "@/features/notifications/store/notificationSlice";
import {
  markAsReadThunk,
  markAllAsReadThunk,
} from "@/features/notifications/store/notificationThunks";

const NOTIFICATION_ICONS = {
  TUTOR_PENDING: "⏳",
  TUTOR_APPROVED: "✅",
  TUTOR_REJECTED: "❌",
};

const NotificationBell = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        aria-label="Thông báo"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => dispatch(markAllAsReadThunk())}
                className="flex items-center gap-1 text-xs text-[#1e3a5f] hover:underline cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm text-slate-400">Chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.read) dispatch(markAsReadThunk(n.id));
                  }}
                  className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50 border-b border-slate-50
                    ${!n.read ? "bg-blue-50/50" : ""}`}
                >
                  <span className="text-lg shrink-0 mt-0.5">
                    {NOTIFICATION_ICONS[n.type] ?? "📢"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.read ? "font-medium text-slate-800" : "text-slate-600"}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(n.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="shrink-0 mt-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
