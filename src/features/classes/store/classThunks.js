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
      return rejectWithValue(err.response?.data?.message || "Không đăng được lớp cần gia sư");
    }
  }
);

export const updateClassThunk = createAsyncThunk(
  "classes/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await classService.update(id, payload);
      return res.data.data.classItem;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Cập nhật bài đăng thất bại");
    }
  }
);

export const deleteClassThunk = createAsyncThunk(
  "classes/delete",
  async (id, { rejectWithValue }) => {
    try {
      await classService.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Xóa bài đăng thất bại");
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

export const fetchMyClassesThunk = createAsyncThunk(
  "classes/fetchMine",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await classService.mine(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không tải được danh sách lớp đã nhận");
    }
  }
);

export const fetchClassFeedThunk = createAsyncThunk(
  "classes/fetchFeed",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await classService.feed(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không tải được bài đăng theo môn");
    }
  }
);

export const fetchMyPostsThunk = createAsyncThunk(
  "classes/fetchMyPosts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await classService.myPosts(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không tải được danh sách bài đăng");
    }
  }
);

export const cancelApplicationThunk = createAsyncThunk(
  "classes/cancelApplication",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const res = await classService.cancelApplication(id, reason);
      return res.data.data.application;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Hủy đơn thất bại");
    }
  }
);

export const completeClassThunk = createAsyncThunk(
  "classes/complete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await classService.completeClass(id);
      return res.data.data.classItem;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Xác nhận hoàn thành thất bại");
    }
  }
);

export const applyForClassThunk = createAsyncThunk(
  "classes/apply",
  async (classId, { rejectWithValue }) => {
    try {
      const res = await classService.apply(classId);
      return res.data.data.application;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không thể gửi yêu cầu nhận lớp");
    }
  }
);
