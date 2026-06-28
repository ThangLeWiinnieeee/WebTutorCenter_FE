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

// Người đăng lấy danh sách gia sư ứng tuyển một bài đăng của mình
export const fetchApplicantsThunk = createAsyncThunk(
  "classes/fetchApplicants",
  async (classId, { rejectWithValue }) => {
    try {
      const res = await classService.getApplicants(classId);
      return res.data.data; // { classItem, applicants }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không tải được danh sách gia sư ứng tuyển");
    }
  }
);

// Người đăng chọn 1 gia sư
export const selectApplicantThunk = createAsyncThunk(
  "classes/selectApplicant",
  async ({ classId, applicationId }, { rejectWithValue }) => {
    try {
      const res = await classService.selectApplicant(classId, applicationId);
      return res.data.data.application;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không thể chọn gia sư");
    }
  }
);

// ── Mời gia sư trực tiếp ──

// Người đăng tạo lớp + mời một gia sư cụ thể
export const createInvitedClassThunk = createAsyncThunk(
  "classes/createInvite",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await classService.createInvite(payload);
      return res.data.data.classItem;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không gửi được lời mời tới gia sư");
    }
  }
);

// Gia sư lấy danh sách lời mời dạy lớp
export const fetchInvitationsThunk = createAsyncThunk(
  "classes/fetchInvitations",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await classService.getInvitations(params);
      return res.data.data; // { invitations, pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không tải được danh sách lời mời");
    }
  }
);

// Gia sư đồng ý lời mời
export const acceptInvitationThunk = createAsyncThunk(
  "classes/acceptInvitation",
  async (applicationId, { rejectWithValue }) => {
    try {
      const res = await classService.acceptInvitation(applicationId);
      return res.data.data.application;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không thể đồng ý lời mời");
    }
  }
);

// Gia sư từ chối lời mời (kèm lý do)
export const declineInvitationThunk = createAsyncThunk(
  "classes/declineInvitation",
  async ({ applicationId, reason }, { rejectWithValue }) => {
    try {
      const res = await classService.declineInvitation(applicationId, reason);
      return res.data.data.application;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không thể từ chối lời mời");
    }
  }
);
