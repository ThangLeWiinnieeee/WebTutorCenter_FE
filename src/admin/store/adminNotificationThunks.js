import { createApiThunk } from "@/app/createApiThunk";
import notificationService from "@/features/notifications/services/notificationService";

// Kênh thông báo dành riêng cho quản trị viên (audience="admin"), tách khỏi chuông
// thông báo nghiệp vụ phía người dùng ở Header.
const ADMIN_AUDIENCE = "admin";

// Lấy danh sách thông báo dành cho admin.
export const fetchAdminNotificationsThunk = createApiThunk(
  "adminNotifications/fetch",
  async (params = {}) => {
    const res = await notificationService.getNotifications({ ...params, audience: ADMIN_AUDIENCE });
    return res.data.data; // { notifications, unreadCount, pagination }
  },
  "Lấy thông báo quản trị thất bại",
);

// Chỉ làm tươi số chưa đọc cho badge (không phá phân trang danh sách đang xem).
export const refreshAdminUnreadCountThunk = createApiThunk(
  "adminNotifications/refreshUnreadCount",
  async () => {
    const res = await notificationService.getNotifications({
      page: 1,
      limit: 1,
      audience: ADMIN_AUDIENCE,
    });
    return res.data.data.unreadCount ?? 0;
  },
  "Lấy số thông báo quản trị chưa đọc thất bại",
);

// Đánh dấu một thông báo admin là đã đọc.
export const markAdminNotificationReadThunk = createApiThunk(
  "adminNotifications/markAsRead",
  async (id) => {
    await notificationService.markAsRead(id);
    return id;
  },
  "Đánh dấu đã đọc thất bại",
);

// Đánh dấu tất cả thông báo admin là đã đọc.
export const markAllAdminNotificationsReadThunk = createApiThunk(
  "adminNotifications/markAllAsRead",
  async () => {
    await notificationService.markAllAsRead(ADMIN_AUDIENCE);
  },
  "Đánh dấu tất cả đã đọc thất bại",
);
