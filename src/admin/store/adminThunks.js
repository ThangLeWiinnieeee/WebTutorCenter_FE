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

export const getAdminUsersThunk = createAsyncThunk(
  "admin/getUsers",
  async (params, { rejectWithValue }) => {
    try {
      const res = await adminService.getUsers(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không lấy được danh sách người dùng");
    }
  }
);

export const updateAdminUserThunk = createAsyncThunk(
  "admin/updateUser",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await adminService.updateUser(id, payload);
      return res.data.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Cập nhật người dùng thất bại");
    }
  }
);

export const updateAdminUserStatusThunk = createAsyncThunk(
  "admin/updateUserStatus",
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const res = await adminService.updateUserStatus(id, isActive);
      return res.data.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Cập nhật trạng thái người dùng thất bại");
    }
  }
);

export const softDeleteAdminUserThunk = createAsyncThunk(
  "admin/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const res = await adminService.deleteUser(id);
      return res.data.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Xóa người dùng thất bại");
    }
  }
);

export const getClassApplicationsThunk = createAsyncThunk(
  "admin/getClassApplications",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await adminService.getClassApplications(params);
      return res.data.data.applications;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không lấy được danh sách đơn đăng ký");
    }
  }
);

export const getClassApplicationStatsThunk = createAsyncThunk(
  "admin/getClassApplicationStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await adminService.getClassApplicationStats();
      return res.data.data.stats;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không lấy được thống kê đơn đăng ký");
    }
  }
);

export const approveClassApplicationThunk = createAsyncThunk(
  "admin/approveClassApplication",
  async (id, { rejectWithValue }) => {
    try {
      const res = await adminService.approveClassApplication(id);
      return res.data.data.application;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Duyệt đơn thất bại");
    }
  }
);

export const rejectClassApplicationThunk = createAsyncThunk(
  "admin/rejectClassApplication",
  async ({ id, rejectionReason }, { rejectWithValue }) => {
    try {
      const res = await adminService.rejectClassApplication(id, rejectionReason);
      return res.data.data.application;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Từ chối đơn thất bại");
    }
  }
);
