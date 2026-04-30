import { createSlice } from "@reduxjs/toolkit";
import { registerTutorThunk, getTutorProfileThunk } from "./tutorThunks";

const initialState = {
  profile: null,
  loading: false,
  error: null,
  registered: false,
};

const tutorSlice = createSlice({
  name: "tutors",
  initialState,
  reducers: {
    clearTutorState: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
      state.registered = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerTutorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerTutorThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.registered = true;
      })
      .addCase(registerTutorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(getTutorProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTutorProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(getTutorProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTutorState } = tutorSlice.actions;
export default tutorSlice.reducer;
