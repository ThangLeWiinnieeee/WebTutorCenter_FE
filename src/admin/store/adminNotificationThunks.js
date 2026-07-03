import { createAsyncThunk } from "@reduxjs/toolkit";
import notificationService from "@/features/notifications/services/notificationService";

// Kênh thông báo dành riêng cho quản trị viên (audience="admin"), tách khỏi chuông
// thông báo nghiệp vụ phía người dùng ở Header.
const ADMIN_AUDIENCE = "admin";

export const fetchAdminNotificationsThunk = createAsyncThunk(
  "adminNotifications/fetch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await notificationService.getNotifications({ ...params, audience: ADMIN_AUDIENCE });
      return res.data.data; // { notifications, unreadCount, pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lấy thông báo quản trị thất bại");
    }
  }
);

// Chỉ làm tươi số chưa đọc cho badge (không phá phân trang danh sách đang xem).
export const refreshAdminUnreadCountThunk = createAsyncThunk(
  "adminNotifications/refreshUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await notificationService.getNotifications({
        page: 1,
        limit: 1,
        audience: ADMIN_AUDIENCE,
      });
      return res.data.data.unreadCount ?? 0;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lấy số thông báo quản trị chưa đọc thất bại");
    }
  }
);

export const markAdminNotificationReadThunk = createAsyncThunk(
  "adminNotifications/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Đánh dấu đã đọc thất bại");
    }
  }
);

export const markAllAdminNotificationsReadThunk = createAsyncThunk(
  "adminNotifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead(ADMIN_AUDIENCE);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Đánh dấu tất cả đã đọc thất bại");
    }
  }
);
