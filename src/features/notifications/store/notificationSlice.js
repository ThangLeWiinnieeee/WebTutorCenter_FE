import { createSlice } from "@reduxjs/toolkit";
import {
  fetchNotificationsThunk,
  markAsReadThunk,
  markAllAsReadThunk,
} from "./notificationThunks";

const notificationSlice = createSlice({
  name: "notifications",
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
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.notifications || [];
        if (action.payload.pagination) state.pagination = action.payload.pagination;
        state.unreadCount = action.payload.unreadCount ?? 0;
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(markAsReadThunk.fulfilled, (state, action) => {
        const item = state.items.find((n) => n.id === action.payload);
        if (item && !item.read) {
          item.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });

    builder
      .addCase(markAllAsReadThunk.fulfilled, (state) => {
        state.items.forEach((n) => {
          n.read = true;
        });
        state.unreadCount = 0;
      });
  },
});

export const { clearNotifications } = notificationSlice.actions;

export const selectNotifications = (state) => state.notifications.items;
export const selectNotificationsPagination = (state) => state.notifications.pagination;
export const selectUnreadCount = (state) => state.notifications.unreadCount;

export default notificationSlice.reducer;
