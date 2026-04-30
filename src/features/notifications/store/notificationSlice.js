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
    loading: false,
    error: null,
  },
  reducers: {
    clearNotifications: (state) => {
      state.items = [];
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
        state.items = action.payload;
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(markAsReadThunk.fulfilled, (state, action) => {
        const item = state.items.find((n) => n.id === action.payload);
        if (item) item.read = true;
      });

    builder
      .addCase(markAllAsReadThunk.fulfilled, (state) => {
        state.items.forEach((n) => {
          n.read = true;
        });
      });
  },
});

export const { clearNotifications } = notificationSlice.actions;

export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) =>
  state.notifications.items.filter((n) => !n.read).length;

export default notificationSlice.reducer;
