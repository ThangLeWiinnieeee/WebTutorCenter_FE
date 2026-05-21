import { createSlice } from "@reduxjs/toolkit";
import {
  registerTutorThunk,
  getTutorProfileThunk,
  getTopTutorsThunk,
  getTopTutorsThisMonthThunk,
  getNewTutorsThunk,
  searchTutorsThunk,
} from "./tutorThunks";

const initialState = {
  // Profile
  profile: null,
  
  // Danh sách
  topTutors: [],
  topTutorsThisMonth: [],
  newTutors: [],
  searchResults: [],
  totalResults: 0,
  currentPage: 1,
  
  // Filter & state
  filters: {},
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
    setFilters: (state, action) => {
      state.filters = action.payload;
      state.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    // Register
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

    // Get Profile
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

    // Get Top Tutors
    builder
      .addCase(getTopTutorsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTopTutorsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.topTutors = action.payload;
      })
      .addCase(getTopTutorsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Top Tutors This Month
    builder
      .addCase(getTopTutorsThisMonthThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTopTutorsThisMonthThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.topTutorsThisMonth = action.payload;
      })
      .addCase(getTopTutorsThisMonthThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get New Tutors
    builder
      .addCase(getNewTutorsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNewTutorsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.newTutors = action.payload;
      })
      .addCase(getNewTutorsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Search Tutors
    builder
      .addCase(searchTutorsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchTutorsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.tutors || [];
        state.totalResults = action.payload.total || 0;
        state.currentPage = action.payload.page || 1;
      })
      .addCase(searchTutorsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTutorState, setFilters, clearFilters } = tutorSlice.actions;
export default tutorSlice.reducer;
