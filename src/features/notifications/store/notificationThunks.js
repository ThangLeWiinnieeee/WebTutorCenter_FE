import { createAsyncThunk } from "@reduxjs/toolkit";
import notificationService from "@/features/notifications/services/notificationService";

export const fetchNotificationsThunk = createAsyncThunk(
  "notifications/fetch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await notificationService.getNotifications(params);
      return res.data.data; // { notifications, unreadCount, pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lấy thông báo thất bại");
    }
  }
);

// Làm tươi nhẹ chỉ số thông báo chưa đọc (cho chuông) — không tải lại danh sách,
// tránh phá phân trang đang xem ở trang Thông báo. Dùng cho polling/refetch khi focus.
export const refreshUnreadCountThunk = createAsyncThunk(
  "notifications/refreshUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await notificationService.getNotifications({ page: 1, limit: 1 });
      return res.data.data.unreadCount ?? 0;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lấy số thông báo chưa đọc thất bại");
    }
  }
);

export const markAsReadThunk = createAsyncThunk(
  "notifications/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Đánh dấu đã đọc thất bại");
    }
  }
);

export const markAllAsReadThunk = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Đánh dấu tất cả đã đọc thất bại");
    }
  }
);
