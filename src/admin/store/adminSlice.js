import { createSlice } from "@reduxjs/toolkit";
import {
  getPendingTutorsThunk,
  approveTutorThunk,
  rejectTutorThunk,
} from "./adminThunks";

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    pendingTutors: [],
    loading: false,
    actionLoading: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
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
