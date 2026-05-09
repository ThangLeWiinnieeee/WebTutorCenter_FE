import { createSlice } from "@reduxjs/toolkit";
import {
  quoteClassThunk,
  createClassThunk,
  fetchClassesThunk,
  fetchClassDetailThunk,
} from "./classThunks";

const initialState = {
  quote: null,
  latestCreated: null,
  list: [],
  pagination: {
    page: 1,
    limit: 6,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
  detail: null,
  loadingQuote: false,
  creating: false,
  loadingList: false,
  loadingDetail: false,
  error: null,
};

const classSlice = createSlice({
  name: "classes",
  initialState,
  reducers: {
    clearClassFlow: (state) => {
      state.quote = null;
      state.latestCreated = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(quoteClassThunk.pending, (state) => {
        state.loadingQuote = true;
        state.error = null;
      })
      .addCase(quoteClassThunk.fulfilled, (state, action) => {
        state.loadingQuote = false;
        state.quote = action.payload;
      })
      .addCase(quoteClassThunk.rejected, (state, action) => {
        state.loadingQuote = false;
        state.error = action.payload;
      })
      .addCase(createClassThunk.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createClassThunk.fulfilled, (state, action) => {
        state.creating = false;
        state.latestCreated = action.payload;
      })
      .addCase(createClassThunk.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(fetchClassesThunk.pending, (state) => {
        state.loadingList = true;
        state.error = null;
      })
      .addCase(fetchClassesThunk.fulfilled, (state, action) => {
        state.loadingList = false;
        state.list = action.payload.classes || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        } else {
          state.pagination = {
            page: 1,
            limit: state.list.length || 6,
            totalItems: state.list.length,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          };
        }
      })
      .addCase(fetchClassesThunk.rejected, (state, action) => {
        state.loadingList = false;
        state.error = action.payload;
      })
      .addCase(fetchClassDetailThunk.pending, (state) => {
        state.loadingDetail = true;
        state.error = null;
      })
      .addCase(fetchClassDetailThunk.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.detail = action.payload;
      })
      .addCase(fetchClassDetailThunk.rejected, (state, action) => {
        state.loadingDetail = false;
        state.error = action.payload;
      });
  },
});

export const { clearClassFlow } = classSlice.actions;
export default classSlice.reducer;
