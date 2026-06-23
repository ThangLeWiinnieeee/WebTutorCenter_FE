import { createSlice } from "@reduxjs/toolkit";
import { fetchMyVouchersThunk } from "./voucherThunks";

const initialState = {
  items: [],
  pagination: {
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  },
  loading: false,
  error: null,
};

const voucherSlice = createSlice({
  name: "vouchers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyVouchersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyVouchersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.vouchers || [];
        if (action.payload.pagination) state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyVouchersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default voucherSlice.reducer;
