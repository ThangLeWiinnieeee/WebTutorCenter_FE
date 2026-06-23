import { createSlice } from "@reduxjs/toolkit";
import {
  quoteClassThunk,
  createClassThunk,
  fetchClassesThunk,
  fetchClassDetailThunk,
  fetchMyClassesThunk,
  fetchClassFeedThunk,
  fetchMyPostsThunk,
  applyForClassThunk,
  cancelApplicationThunk,
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
  myClasses: [],
  myClassesPagination: {
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
  myClassesCounts: { all: 0, pending: 0, approved: 0, rejected: 0 },
  loadingMyClasses: false,
  feed: [],
  feedPagination: {
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
  feedSubjects: [],
  feedNewCount: 0,
  loadingFeed: false,
  myPosts: [],
  myPostsPagination: {
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
  loadingMyPosts: false,
  loadingQuote: false,
  creating: false,
  loadingList: false,
  loadingDetail: false,
  applying: false,
  applyError: null,
  cancellingApplication: false,
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
      })
      .addCase(fetchMyClassesThunk.pending, (state) => {
        state.loadingMyClasses = true;
        state.error = null;
      })
      .addCase(fetchMyClassesThunk.fulfilled, (state, action) => {
        state.loadingMyClasses = false;
        state.myClasses = action.payload.applications || [];
        if (action.payload.pagination) state.myClassesPagination = action.payload.pagination;
        if (action.payload.counts) state.myClassesCounts = action.payload.counts;
      })
      .addCase(fetchMyClassesThunk.rejected, (state, action) => {
        state.loadingMyClasses = false;
        state.error = action.payload;
      })
      .addCase(fetchClassFeedThunk.pending, (state) => {
        state.loadingFeed = true;
        state.error = null;
      })
      .addCase(fetchClassFeedThunk.fulfilled, (state, action) => {
        state.loadingFeed = false;
        state.feed = action.payload.classes || [];
        state.feedSubjects = action.payload.subjects || [];
        state.feedNewCount = action.payload.newCount || 0;
        if (action.payload.pagination) state.feedPagination = action.payload.pagination;
      })
      .addCase(fetchClassFeedThunk.rejected, (state, action) => {
        state.loadingFeed = false;
        state.error = action.payload;
      })
      .addCase(fetchMyPostsThunk.pending, (state) => {
        state.loadingMyPosts = true;
        state.error = null;
      })
      .addCase(fetchMyPostsThunk.fulfilled, (state, action) => {
        state.loadingMyPosts = false;
        state.myPosts = action.payload.classes || [];
        if (action.payload.pagination) state.myPostsPagination = action.payload.pagination;
      })
      .addCase(fetchMyPostsThunk.rejected, (state, action) => {
        state.loadingMyPosts = false;
        state.error = action.payload;
      })
      .addCase(applyForClassThunk.pending, (state) => {
        state.applying = true;
        state.applyError = null;
      })
      .addCase(applyForClassThunk.fulfilled, (state) => {
        state.applying = false;
      })
      .addCase(applyForClassThunk.rejected, (state, action) => {
        state.applying = false;
        state.applyError = action.payload;
      });

    builder
      .addCase(cancelApplicationThunk.pending, (state) => {
        state.cancellingApplication = true;
        state.error = null;
      })
      .addCase(cancelApplicationThunk.fulfilled, (state) => {
        state.cancellingApplication = false;
      })
      .addCase(cancelApplicationThunk.rejected, (state, action) => {
        state.cancellingApplication = false;
        state.error = action.payload;
      });
  },
});

export const { clearClassFlow } = classSlice.actions;
export default classSlice.reducer;
