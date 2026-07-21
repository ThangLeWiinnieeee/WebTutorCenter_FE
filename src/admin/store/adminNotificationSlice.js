import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAdminNotificationsThunk,
  refreshAdminUnreadCountThunk,
  markAdminNotificationReadThunk,
  markAllAdminNotificationsReadThunk,
} from "./adminNotificationThunks";

// Chuông thông báo riêng của khu quản trị. Cùng feature "notifications" nhưng giữ
// bucket state độc lập với chuông phía người dùng để hai chuông không lẫn nhau.
const adminNotificationSlice = createSlice({
  name: "adminNotifications",
  initialState: {
    items: [],
    pagination: {
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 1,
    },
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearAdminNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminNotificationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminNotificationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.notifications || [];
        if (action.payload.pagination) state.pagination = action.payload.pagination;
        state.unreadCount = action.payload.unreadCount ?? 0;
      })
      .addCase(fetchAdminNotificationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      // Polling/focus: chỉ cập nhật số chưa đọc, giữ nguyên danh sách + phân trang đang xem.
      .addCase(refreshAdminUnreadCountThunk.fulfilled, (state, action) => {
        state.unreadCount = action.payload ?? 0;
      });

    builder.addCase(markAdminNotificationReadThunk.fulfilled, (state, action) => {
      const item = state.items.find((n) => n.id === action.payload);
      if (item && !item.read) {
        item.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    builder.addCase(markAllAdminNotificationsReadThunk.fulfilled, (state) => {
      state.items.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    });
  },
});

export const { clearAdminNotifications } = adminNotificationSlice.actions;

// Selector: danh sách thông báo admin.
export const selectAdminNotifications = (state) => state.adminNotifications.items;
// Selector: thông tin phân trang của danh sách thông báo admin.
export const selectAdminNotificationsPagination = (state) => state.adminNotifications.pagination;
// Selector: số thông báo admin chưa đọc.
export const selectAdminUnreadCount = (state) => state.adminNotifications.unreadCount;

export default adminNotificationSlice.reducer;
