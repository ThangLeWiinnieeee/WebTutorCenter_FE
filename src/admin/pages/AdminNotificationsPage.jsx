import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Ban,
  Bell,
  BellRing,
  CheckCheck,
  ClipboardCheck,
  RotateCcw,
  UserCheck,
} from "lucide-react";

import Pagination from "@/components/shared/Pagination";
import NotificationItem from "@/features/notifications/components/NotificationItem";
import { ADMIN_PAGE_SIZE as PAGE_SIZE } from "@/admin/constants";
import {
  selectAdminNotifications,
  selectAdminNotificationsPagination,
  selectAdminUnreadCount,
} from "@/admin/store/adminNotificationSlice";
import {
  fetchAdminNotificationsThunk,
  markAdminNotificationReadThunk,
  markAllAdminNotificationsReadThunk,
} from "@/admin/store/adminNotificationThunks";

// Icon cho từng loại thông báo quản trị.
const NOTIFICATION_ICON_MAP = {
  CLASS_APPLICATION_SELECTED: { icon: ClipboardCheck, className: "bg-amber-50 text-amber-600" },
  CLASS_APPLICATION_CANCELLED: { icon: Ban, className: "bg-slate-100 text-slate-500" },
  CLASS_APPLICATION_CANCEL_REQUESTED: { icon: RotateCcw, className: "bg-orange-50 text-orange-600" },
  PROFILE_CHANGE_PENDING: { icon: UserCheck, className: "bg-amber-50 text-amber-600" },
};

const DEFAULT_NOTIFICATION_ICON = { icon: Bell, className: "bg-slate-100 text-slate-500" };

// Thông báo quản trị dẫn tới trang duyệt tương ứng.
const NOTIFICATION_LINK = {
  CLASS_APPLICATION_SELECTED: { to: "/admin/class-applications", label: "Đến trang duyệt nhận lớp" },
  CLASS_APPLICATION_CANCELLED: { to: "/admin/class-applications", label: "Đến trang duyệt nhận lớp" },
  CLASS_APPLICATION_CANCEL_REQUESTED: { to: "/admin/application-cancellations", label: "Đến trang duyệt hủy đơn" },
  PROFILE_CHANGE_PENDING: { to: "/admin/profile-changes", label: "Đến trang duyệt đổi hồ sơ" },
};

const AdminNotificationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notifications = useSelector(selectAdminNotifications);
  const pagination = useSelector(selectAdminNotificationsPagination);
  const unreadCount = useSelector(selectAdminUnreadCount);
  const loading = useSelector((state) => state.adminNotifications.loading);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAdminNotificationsThunk({ page, limit: PAGE_SIZE }));
  }, [dispatch, page]);

  const totalPages = pagination?.totalPages || 1;
  const handlePageChange = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Heading */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#1e3a5f]">
            <BellRing className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">Thông báo quản trị</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Thông báo dành cho quản trị viên</h1>
          <p className="mt-1 text-sm text-slate-500">
            Các việc cần xử lý: duyệt nhận lớp, duyệt hủy đơn, duyệt đổi hồ sơ...
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => dispatch(markAllAdminNotificationsReadThunk())}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-[#1e3a5f] transition-colors hover:bg-slate-50"
          >
            <CheckCheck className="h-4 w-4" />
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {loading && notifications.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Bell className="h-7 w-7" />
          </div>
          <p className="text-base font-semibold text-slate-700">Chưa có thông báo nào</p>
          <p className="max-w-md text-sm text-slate-500">
            Các thông báo cần quản trị viên xử lý sẽ xuất hiện ở đây.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const meta = NOTIFICATION_ICON_MAP[n.type] || DEFAULT_NOTIFICATION_ICON;
            const link = NOTIFICATION_LINK[n.type];
            return (
              <NotificationItem
                key={n.id}
                notification={n}
                iconMeta={meta}
                link={link}
                onClick={() => {
                  if (!n.read) dispatch(markAdminNotificationReadThunk(n.id));
                  if (link) navigate(link.to);
                }}
              />
            );
          })}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="pt-3"
          />
        </div>
      )}
    </div>
  );
};

export default AdminNotificationsPage;
