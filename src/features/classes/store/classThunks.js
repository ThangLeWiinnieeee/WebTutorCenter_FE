import { createAsyncThunk } from "@reduxjs/toolkit";
import classService from "@/features/classes/services/classService";

export const quoteClassThunk = createAsyncThunk(
  "classes/quote",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await classService.quote(payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không tính được học phí");
    }
  }
);

export const createClassThunk = createAsyncThunk(
  "classes/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await classService.create(payload);
      return res.data.data.classItem;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không đăng được lớp mới");
    }
  }
);

export const fetchClassesThunk = createAsyncThunk(
  "classes/fetchList",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const res = await classService.list(filters);
      return {
        classes: res.data.data.classes || [],
        pagination: res.data.data.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không tải được danh sách lớp");
    }
  }
);

export const fetchClassDetailThunk = createAsyncThunk(
  "classes/fetchDetail",
  async (id, { rejectWithValue }) => {
    try {
      const res = await classService.detail(id);
      return res.data.data.classItem;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không tải được chi tiết lớp");
    }
  }
);
