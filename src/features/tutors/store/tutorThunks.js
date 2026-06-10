import { createAsyncThunk } from "@reduxjs/toolkit";
import tutorService from "@/features/tutors/services/tutorService";

export const registerTutorThunk = createAsyncThunk(
  "tutors/register",
  async (data, { rejectWithValue }) => {
    try {
      const res = await tutorService.register(data);
      return res.data.data.tutor;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Đăng ký gia sư thất bại");
    }
  }
);

export const getTutorProfileThunk = createAsyncThunk(
  "tutors/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await tutorService.getProfile();
      return res.data.data.tutor;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không lấy được hồ sơ gia sư");
    }
  }
);

export const getTopTutorsThunk = createAsyncThunk(
  "tutors/getTop",
  async (limit = 10, { rejectWithValue }) => {
    try {
      const res = await tutorService.getTopTutors(limit);
      return res.data.data.tutors || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lấy danh sách gia sư nổi bật thất bại");
    }
  }
);

export const getTopTutorsThisMonthThunk = createAsyncThunk(
  "tutors/getTopThisMonth",
  async (limit = 10, { rejectWithValue }) => {
    try {
      const res = await tutorService.getTopTutorsThisMonth(limit);
      return res.data.data.tutors || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lấy danh sách gia sư tháng này thất bại");
    }
  }
);

export const getNewTutorsThunk = createAsyncThunk(
  "tutors/getNew",
  async ({ days = 30, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const res = await tutorService.getNewTutors(days, limit);
      return res.data.data.tutors || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lấy danh sách gia sư mới thất bại");
    }
  }
);

export const searchTutorsThunk = createAsyncThunk(
  "tutors/search",
  async ({ filters = {}, page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const res = await tutorService.searchTutors(filters, page, limit);
      return {
        tutors: res.data.data.tutors || [],
        total: res.data.data.total || 0,
        page: page,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Tìm kiếm gia sư thất bại");
    }
  }
);
