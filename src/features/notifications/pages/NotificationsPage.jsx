import { useEffect, useState } from "react";
import { Ban, Bell, BellRing, CalendarX2, CheckCheck, CheckCircle2, Clock, Gift, GraduationCap, Handshake, RotateCcw, UserCheck, XCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AOS from "aos";

import useAuth from "@/features/auth/hooks/useAuth";
import ClassFeedPanel from "@/features/classes/components/ClassFeedPanel";
import NotificationItem from "@/features/notifications/components/NotificationItem";
import Pagination from "@/components/shared/Pagination";
import {
  selectNotifications,
  selectNotificationsPagination,
  selectUnreadCount,
} from "@/features/notifications/store/notificationSlice";
import {
  fetchNotificationsThunk,
  markAsReadThunk,
  markAllAsReadThunk,
} from "@/features/notifications/store/notificationThunks";
import { fetchClassFeedThunk } from "@/features/classes/store/classThunks";

const PAGE_SIZE = 10;

// Icon cho từng loại thông báo — lấy từ thư viện lucide-react, không dùng emoji thẳng.
const NOTIFICATION_ICON_MAP = {
  TUTOR_PENDING: { icon: Clock, className: "bg-amber-50 text-amber-600" },
  TUTOR_APPROVED: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600" },
  TUTOR_REJECTED: { icon: XCircle, className: "bg-rose-50 text-rose-600" },
  CLASS_APPLICATION_PENDING: { icon: Clock, className: "bg-amber-50 text-amber-600" },
  CLASS_APPLICATION_SELECTED: { icon: Clock, className: "bg-amber-50 text-amber-600" },
  CLASS_APPLICATION_APPROVED: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600" },
  CLASS_APPLICATION_REJECTED: { icon: XCircle, className: "bg-rose-50 text-rose-600" },
  PROFILE_CHANGE_PENDING: { icon: Clock, className: "bg-amber-50 text-amber-600" },
  PROFILE_CHANGE_APPROVED: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600" },
  PROFILE_CHANGE_REJECTED: { icon: XCircle, className: "bg-rose-50 text-rose-600" },
  CLASS_APPLICATION_CANCELLED: { icon: Ban, className: "bg-slate-100 text-slate-500" },
  CLASS_APPLICATION_CANCEL_REQUESTED: { icon: RotateCcw, className: "bg-orange-50 text-orange-600" },
  CLASS_APPLICATION_CANCEL_APPROVED: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600" },
  CLASS_APPLICATION_CANCEL_REJECTED: { icon: XCircle, className: "bg-rose-50 text-rose-600" },
  CLASS_MATCHED: { icon: UserCheck, className: "bg-emerald-50 text-emerald-600" },
  CLASS_EXPIRED: { icon: CalendarX2, className: "bg-rose-50 text-rose-600" },
  CLASS_COMPLETED_REWARD: { icon: Gift, className: "bg-violet-50 text-violet-600" },
  CLASS_INVITE_RECEIVED: { icon: Handshake, className: "bg-blue-50 text-[#1e3a5f]" },
  CLASS_INVITE_ACCEPTED: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600" },
  CLASS_INVITE_DECLINED: { icon: XCircle, className: "bg-rose-50 text-rose-600" },
};

const DEFAULT_NOTIFICATION_ICON = { icon: Bell, className: "bg-slate-100 text-slate-500" };

// Một số loại thông báo có thể bấm để đi tới trang liên quan.
// CLASS_APPLICATION_PENDING (gửi cho người đăng khi có gia sư ứng tuyển) → mở "Bài đăng của tôi" để chọn gia sư.
// CLASS_MATCHED (gửi cho người đăng khi admin duyệt gia sư) → mở "Bài đăng của tôi".
// CLASS_COMPLETED_REWARD (tặng mã giảm giá khi hoàn thành lớp) → mở "Kho mã giảm giá".
const NOTIFICATION_LINK = {
  CLASS_APPLICATION_PENDING: { to: "/my-posts", label: "Xem bài đăng của tôi" },
  CLASS_MATCHED: { to: "/my-posts", label: "Xem bài đăng của tôi" },
  CLASS_COMPLETED_REWARD: { to: "/my-vouchers", label: "Xem kho mã giảm giá" },
  // Luồng mời gia sư trực tiếp
  CLASS_INVITE_RECEIVED: { to: "/class-invitations", label: "Xem lời mời dạy lớp" },
  CLASS_INVITE_ACCEPTED: { to: "/my-posts", label: "Xem bài đăng của tôi" },
  CLASS_INVITE_DECLINED: { to: "/my-posts", label: "Xem bài đăng của tôi" },
  // Gia sư được admin duyệt nhận lớp → mở danh sách nhận lớp
  CLASS_APPLICATION_APPROVED: { to: "/my-classes", label: "Xem danh sách nhận lớp" },
};

const NotificationsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notifications = useSelector(selectNotifications);
  const pagination = useSelector(selectNotificationsPagination);
  const unreadCount = useSelector(selectUnreadCount);
  const loading = useSelector((state) => state.notifications.loading);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchNotificationsThunk({ page, limit: PAGE_SIZE }));
  }, [dispatch, page]);

  // Tính lại vị trí animation khi danh sách (tải bất đồng bộ) thay đổi
  useEffect(() => {
    AOS.refresh();
  }, [loading, notifications.length]);

  const totalPages = pagination?.totalPages || 1;
  const handlePageChange = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Bell className="h-7 w-7" />
        </div>
        <p className="text-base font-semibold text-slate-700">Chưa có thông báo nào</p>
        <p className="max-w-md text-sm text-slate-500">
          Các thông báo về duyệt hồ sơ, kết quả nhận lớp... sẽ xuất hiện ở đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => dispatch(markAllAsReadThunk())}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1e3a5f] hover:underline"
          >
            <CheckCheck className="h-4 w-4" />
            Đánh dấu tất cả đã đọc
          </button>
        </div>
      )}

      {notifications.map((n, idx) => {
        const meta = NOTIFICATION_ICON_MAP[n.type] || DEFAULT_NOTIFICATION_ICON;
        const link = NOTIFICATION_LINK[n.type];
        return (
          // Lớp ngoài chỉ giữ hiệu ứng AOS với className tĩnh: khi bấm "đã đọc",
          // React chỉ ghi lại class ở lớp trong nên không xoá mất class `aos-animate`
          // mà AOS gắn trực tiếp lên DOM → thông báo không bị animate lại từ đầu.
          <div key={n.id} data-aos="fade-up" data-aos-delay={Math.min(idx, 6) * 40}>
            <NotificationItem
              notification={n}
              iconMeta={meta}
              link={link}
              onClick={() => {
                if (!n.read) dispatch(markAsReadThunk(n.id));
                if (link) navigate(link.to);
              }}
            />
          </div>
        );
      })}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className="pt-3"
      />
    </div>
  );
};

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const unreadCount = useSelector(selectUnreadCount);
  const feedNewCount = useSelector((state) => state.classes.feedNewCount);
  const isTutor = user?.role === "tutor";
  const [activeTab, setActiveTab] = useState("notifications");

  useEffect(() => {
    // Danh sách thông báo (kèm phân trang) do NotificationsList tự tải.
    // Ở đây chỉ lấy số bài đăng mới phù hợp môn dạy để hiển thị badge đỏ trên tab.
    if (isTutor) dispatch(fetchClassFeedThunk());
  }, [dispatch, isTutor]);

  const tabs = [
    { value: "notifications", label: "Thông báo", icon: Bell, badge: unreadCount },
    ...(isTutor
      ? [{ value: "classFeed", label: "Lớp mới theo môn", icon: GraduationCap, badge: feedNewCount }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header band */}
      <div className="border-b border-slate-200 bg-linear-to-r from-[#1e3a5f] to-[#2c5282]">
        <div className="mx-auto max-w-5xl px-6 py-8" data-aos="fade-down">
          <div className="flex items-center gap-2 text-emerald-300">
            <BellRing className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">Trung tâm thông báo</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white">Thông báo của bạn</h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.badge > 0 && (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-bold text-white">
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === "notifications" ? <NotificationsList /> : <ClassFeedPanel />}
      </div>
    </div>
  );
};

export default NotificationsPage;
