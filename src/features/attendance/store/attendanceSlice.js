import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAttendanceOverviewThunk,
  checkInSessionThunk,
  confirmCheckInThunk,
  rejectCheckInThunk,
  checkOutSessionThunk,
  confirmCheckOutThunk,
  rejectCheckOutThunk,
  openDisputeThunk,
  fetchAdminAttendanceSessionsThunk,
  adminConfirmOnBehalfThunk,
  adminResolveSessionThunk,
} from "./attendanceThunks";

const initialState = {
  overview: null, // { classInfo, viewerRole, periods, currentPeriod, activeSession, sessions }
  loadingOverview: false,
  actionLoading: false,
  error: null,
  adminSessions: [],
  adminCounts: {
    total: 0,
    needsAttention: 0,
    disputedPending: 0,
    valid: 0,
    waitingConfirm: 0,
  },
  adminPagination: null,
  loadingAdmin: false,
  adminActionLoading: false,
};

const replaceSessionInOverview = (state, updatedSession) => {
  if (!state.overview || !updatedSession) return;
  const idx = state.overview.sessions.findIndex((s) => s.id === updatedSession.id);
  if (idx !== -1) {
    state.overview.sessions[idx] = updatedSession;
  } else {
    state.overview.sessions.unshift(updatedSession);
  }
  if (state.overview.activeSession?.id === updatedSession.id) {
    const isStillOpen = [
      "WAITING_CHECKIN_CONFIRMATION",
      "IN_PROGRESS",
      "WAITING_CHECKOUT_CONFIRMATION",
    ].includes(updatedSession.status);
    state.overview.activeSession = isStillOpen ? updatedSession : null;
  }
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    clearAttendanceOverview: (state) => {
      state.overview = null;
      state.error = null;
    },
    upsertRealtimeSession: (state, action) => {
      replaceSessionInOverview(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendanceOverviewThunk.pending, (state) => {
        state.loadingOverview = true;
        state.error = null;
      })
      .addCase(fetchAttendanceOverviewThunk.fulfilled, (state, action) => {
        state.loadingOverview = false;
        state.overview = action.payload;
      })
      .addCase(fetchAttendanceOverviewThunk.rejected, (state, action) => {
        state.loadingOverview = false;
        state.error = action.payload;
      })
      // Admin list (phải đặt addCase trước addMatcher theo quy tắc RTK)
      .addCase(fetchAdminAttendanceSessionsThunk.pending, (state) => {
        state.loadingAdmin = true;
      })
      .addCase(fetchAdminAttendanceSessionsThunk.fulfilled, (state, action) => {
        state.loadingAdmin = false;
        state.adminSessions = action.payload.sessions || [];
        state.adminCounts = action.payload.counts || initialState.adminCounts;
        state.adminPagination = action.payload.pagination || null;
      })
      .addCase(fetchAdminAttendanceSessionsThunk.rejected, (state) => {
        state.loadingAdmin = false;
      })
      // User actions
      .addMatcher(
        (action) =>
          [
            checkInSessionThunk.pending.type,
            confirmCheckInThunk.pending.type,
            rejectCheckInThunk.pending.type,
            checkOutSessionThunk.pending.type,
            confirmCheckOutThunk.pending.type,
            rejectCheckOutThunk.pending.type,
            openDisputeThunk.pending.type,
          ].includes(action.type),
        (state) => {
          state.actionLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          [
            checkInSessionThunk.fulfilled.type,
            confirmCheckInThunk.fulfilled.type,
            rejectCheckInThunk.fulfilled.type,
            checkOutSessionThunk.fulfilled.type,
            confirmCheckOutThunk.fulfilled.type,
            rejectCheckOutThunk.fulfilled.type,
            openDisputeThunk.fulfilled.type,
          ].includes(action.type),
        (state, action) => {
          state.actionLoading = false;
          if (action.payload?.session) {
            replaceSessionInOverview(state, action.payload.session);
          }
        }
      )
      .addMatcher(
        (action) =>
          [
            checkInSessionThunk.rejected.type,
            confirmCheckInThunk.rejected.type,
            rejectCheckInThunk.rejected.type,
            checkOutSessionThunk.rejected.type,
            confirmCheckOutThunk.rejected.type,
            rejectCheckOutThunk.rejected.type,
            openDisputeThunk.rejected.type,
          ].includes(action.type),
        (state, action) => {
          state.actionLoading = false;
          state.error = action.payload;
        }
      )
      // Admin actions
      .addMatcher(
        (action) =>
          [
            adminConfirmOnBehalfThunk.pending.type,
            adminResolveSessionThunk.pending.type,
          ].includes(action.type),
        (state) => {
          state.adminActionLoading = true;
        }
      )
      .addMatcher(
        (action) =>
          [
            adminConfirmOnBehalfThunk.fulfilled.type,
            adminResolveSessionThunk.fulfilled.type,
          ].includes(action.type),
        (state, action) => {
          state.adminActionLoading = false;
          const updated = action.payload?.session;
          if (updated) {
            const idx = state.adminSessions.findIndex((s) => s.id === updated.id);
            if (idx !== -1) state.adminSessions[idx] = updated;
          }
        }
      )
      .addMatcher(
        (action) =>
          [
            adminConfirmOnBehalfThunk.rejected.type,
            adminResolveSessionThunk.rejected.type,
          ].includes(action.type),
        (state) => {
          state.adminActionLoading = false;
        }
      );
  },
});

export const { clearAttendanceOverview, upsertRealtimeSession } = attendanceSlice.actions;
export default attendanceSlice.reducer;
