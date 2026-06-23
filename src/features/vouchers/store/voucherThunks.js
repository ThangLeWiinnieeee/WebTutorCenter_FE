import { createAsyncThunk } from "@reduxjs/toolkit";
import voucherService from "@/features/vouchers/services/voucherService";

export const fetchMyVouchersThunk = createAsyncThunk(
  "vouchers/fetchMine",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await voucherService.getMyVouchers(params);
      return res.data.data; // { vouchers, pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không tải được kho mã giảm giá");
    }
  }
);
