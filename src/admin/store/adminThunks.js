import { createAsyncThunk } from "@reduxjs/toolkit";
import adminService from "@/admin/services/adminService";

export const getDashboardStatsThunk = createAsyncThunk(
  "admin/getDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await adminService.getDashboardStats();
      return res.data.data.stats;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không lấy được thống kê");
    }
  }
);

export const getPendingTutorsThunk = createAsyncThunk(
  "admin/getPendingTutors",
  async (_, { rejectWithValue }) => {
    try {
      const res = await adminService.getPendingTutors();
      return res.data.data.tutors;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không lấy được danh sách");
    }
  }
);

export const approveTutorThunk = createAsyncThunk(
  "admin/approveTutor",
  async (id, { rejectWithValue }) => {
    try {
      const res = await adminService.approveTutor(id);
      return res.data.data.tutor;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Phê duyệt thất bại");
    }
  }
);

export const rejectTutorThunk = createAsyncThunk(
  "admin/rejectTutor",
  async ({ id, rejectionReason }, { rejectWithValue }) => {
    try {
      const res = await adminService.rejectTutor(id, rejectionReason);
      return res.data.data.tutor;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Từ chối thất bại");
    }
  }
);
