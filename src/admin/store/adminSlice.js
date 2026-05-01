import { createSlice } from "@reduxjs/toolkit";
import {
  getDashboardStatsThunk,
  getPendingTutorsThunk,
  approveTutorThunk,
  rejectTutorThunk,
} from "./adminThunks";

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    dashboardStats: {
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
    },
    statsLoading: false,
    pendingTutors: [],
    loading: false,
    actionLoading: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardStatsThunk.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(getDashboardStatsThunk.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(getDashboardStatsThunk.rejected, (state) => {
        state.statsLoading = false;
      });

    builder
      .addCase(getPendingTutorsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingTutorsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingTutors = action.payload;
      })
      .addCase(getPendingTutorsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(approveTutorThunk.pending, (state, action) => {
        state.actionLoading = action.meta.arg;
      })
      .addCase(approveTutorThunk.fulfilled, (state, action) => {
        state.actionLoading = null;
        state.pendingTutors = state.pendingTutors.filter(
          (t) => t.id !== action.payload.id
        );
      })
      .addCase(approveTutorThunk.rejected, (state) => {
        state.actionLoading = null;
      });

    builder
      .addCase(rejectTutorThunk.pending, (state, action) => {
        state.actionLoading = action.meta.arg.id;
      })
      .addCase(rejectTutorThunk.fulfilled, (state, action) => {
        state.actionLoading = null;
        state.pendingTutors = state.pendingTutors.filter(
          (t) => t.id !== action.payload.id
        );
      })
      .addCase(rejectTutorThunk.rejected, (state) => {
        state.actionLoading = null;
      });
  },
});

export default adminSlice.reducer;
