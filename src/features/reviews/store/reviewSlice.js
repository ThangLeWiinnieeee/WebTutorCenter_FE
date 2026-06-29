import { createSlice } from "@reduxjs/toolkit";
import { createReviewThunk, replyToReviewThunk } from "./reviewThunks";

const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    submitting: false,
    error: null,
    replying: false,
    replyError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createReviewThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createReviewThunk.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(createReviewThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(replyToReviewThunk.pending, (state) => {
        state.replying = true;
        state.replyError = null;
      })
      .addCase(replyToReviewThunk.fulfilled, (state) => {
        state.replying = false;
      })
      .addCase(replyToReviewThunk.rejected, (state, action) => {
        state.replying = false;
        state.replyError = action.payload;
      });
  },
});

export default reviewSlice.reducer;
