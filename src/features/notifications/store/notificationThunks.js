import { createApiThunk } from "@/app/createApiThunk";
import notificationService from "@/features/notifications/services/notificationService";

// Lấy danh sách thông báo của người dùng.
export const fetchNotificationsThunk = createApiThunk(
  "notifications/fetch",
  async (params = {}) => {
    const res = await notificationService.getNotifications(params);
    return res.data.data; // { notifications, unreadCount, pagination }
  },
  "Lấy thông báo thất bại",
);

// Làm tươi nhẹ chỉ số thông báo chưa đọc (cho chuông) — không tải lại danh sách,
// tránh phá phân trang đang xem ở trang Thông báo. Dùng cho polling/refetch khi focus.
export const refreshUnreadCountThunk = createApiThunk(
  "notifications/refreshUnreadCount",
  async () => {
    const res = await notificationService.getNotifications({ page: 1, limit: 1 });
    return res.data.data.unreadCount ?? 0;
  },
  "Lấy số thông báo chưa đọc thất bại",
);

// Đánh dấu một thông báo là đã đọc.
export const markAsReadThunk = createApiThunk(
  "notifications/markAsRead",
  async (id) => {
    await notificationService.markAsRead(id);
    return id;
  },
  "Đánh dấu đã đọc thất bại",
);

// Đánh dấu tất cả thông báo là đã đọc.
export const markAllAsReadThunk = createApiThunk(
  "notifications/markAllAsRead",
  async () => {
    await notificationService.markAllAsRead();
  },
  "Đánh dấu tất cả đã đọc thất bại",
);
