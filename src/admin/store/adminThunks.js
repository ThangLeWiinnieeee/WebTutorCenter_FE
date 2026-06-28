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
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await adminService.getPendingTutors(params);
      return res.data.data; // { tutors, pagination }
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
      return res.data.data; // { applications, pagination, counts }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không lấy được danh sách đơn đăng ký");
    }
  }
);

export const getClassApplicationStatsThunk = createAsyncThunk(
  "admin/getClassApplicationStats",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await adminService.getClassApplicationStats(params);
      return res.data.data.stats;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không lấy được thống kê đơn đăng ký");
    }
  }
);

// Số đơn "chờ duyệt" (status selected) cho CẢ 2 mục origin để hiện badge trên 2 tab.
export const getClassApplicationOriginCountsThunk = createAsyncThunk(
  "admin/getClassApplicationOriginCounts",
  async (_, { rejectWithValue }) => {
    try {
      const [applyRes, inviteRes] = await Promise.all([
        adminService.getClassApplicationStats({ origin: "apply" }),
        adminService.getClassApplicationStats({ origin: "invite" }),
      ]);
      return {
        apply: applyRes.data.data.stats.selected ?? 0,
        invite: inviteRes.data.data.stats.selected ?? 0,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không lấy được số đơn chờ duyệt");
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

// ──────────────────────────── Class (bài đăng tìm gia sư) ────────────────────────────

export const getAdminClassesThunk = createAsyncThunk(
  "admin/getClasses",
  async (params, { rejectWithValue }) => {
    try {
      const res = await adminService.getAdminClasses(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không lấy được danh sách bài đăng");
    }
  }
);

export const getAdminClassDetailThunk = createAsyncThunk(
  "admin/getClassDetail",
  async (id, { rejectWithValue }) => {
    try {
      const res = await adminService.getAdminClassDetail(id);
      return res.data.data.classItem;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không lấy được chi tiết bài đăng");
    }
  }
);

export const deleteAdminClassThunk = createAsyncThunk(
  "admin/deleteClass",
  async (id, { rejectWithValue }) => {
    try {
      await adminService.deleteAdminClass(id);
      return { id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Xóa bài đăng thất bại");
    }
  }
);

// ──────────────────────────── Trash (thùng rác) ────────────────────────────

export const getTrashCountsThunk = createAsyncThunk(
  "admin/getTrashCounts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await adminService.getTrashCounts();
      return res.data.data.counts;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không lấy được số lượng thùng rác");
    }
  }
);

export const getTrashItemsThunk = createAsyncThunk(
  "admin/getTrashItems",
  async ({ type, params }, { rejectWithValue }) => {
    try {
      const res = await adminService.getTrashItems(type, params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không lấy được danh sách thùng rác");
    }
  }
);

export const restoreTrashItemThunk = createAsyncThunk(
  "admin/restoreTrashItem",
  async ({ type, id }, { rejectWithValue }) => {
    try {
      await adminService.restoreTrashItem(type, id);
      return { id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Khôi phục thất bại");
    }
  }
);

export const purgeTrashItemThunk = createAsyncThunk(
  "admin/purgeTrashItem",
  async ({ type, id }, { rejectWithValue }) => {
    try {
      await adminService.purgeTrashItem(type, id);
      return { id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Xóa vĩnh viễn thất bại");
    }
  }
);

// ──────────────────────────── Profile change requests (gia sư đổi hồ sơ) ────────────────────────────

export const getProfileChangesThunk = createAsyncThunk(
  "admin/getProfileChanges",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await adminService.getProfileChanges(params);
      return res.data.data; // { requests, pagination, counts }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không lấy được danh sách yêu cầu đổi thông tin");
    }
  }
);

export const approveProfileChangeThunk = createAsyncThunk(
  "admin/approveProfileChange",
  async (id, { rejectWithValue }) => {
    try {
      const res = await adminService.approveProfileChange(id);
      return res.data.data.request;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Duyệt yêu cầu thất bại");
    }
  }
);

export const rejectProfileChangeThunk = createAsyncThunk(
  "admin/rejectProfileChange",
  async ({ id, rejectionReason }, { rejectWithValue }) => {
    try {
      const res = await adminService.rejectProfileChange(id, rejectionReason);
      return res.data.data.request;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Từ chối yêu cầu thất bại");
    }
  }
);

// ──────────────────────────── Hủy đơn nhận lớp (gia sư rút đơn) ────────────────────────────

export const getApplicationCancellationsThunk = createAsyncThunk(
  "admin/getApplicationCancellations",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await adminService.getApplicationCancellations(params);
      return res.data.data; // { cancellations, pagination, counts }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không lấy được danh sách đơn hủy");
    }
  }
);

export const approveCancellationThunk = createAsyncThunk(
  "admin/approveCancellation",
  async (id, { rejectWithValue }) => {
    try {
      const res = await adminService.approveCancellation(id);
      return res.data.data.application;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Duyệt hủy đơn thất bại");
    }
  }
);

export const rejectCancellationThunk = createAsyncThunk(
  "admin/rejectCancellation",
  async ({ id, rejectionReason }, { rejectWithValue }) => {
    try {
      const res = await adminService.rejectCancellation(id, rejectionReason);
      return res.data.data.application;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Từ chối hủy đơn thất bại");
    }
  }
);

// ──────────────────────────── Promo (mã ưu đãi) ────────────────────────────

export const getPromosThunk = createAsyncThunk(
  "admin/getPromos",
  async (params, { rejectWithValue }) => {
    try {
      const res = await adminService.getPromos(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không lấy được danh sách mã ưu đãi");
    }
  }
);

export const createPromoThunk = createAsyncThunk(
  "admin/createPromo",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await adminService.createPromo(payload);
      return res.data.data.promo;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Tạo mã ưu đãi thất bại");
    }
  }
);

export const updatePromoThunk = createAsyncThunk(
  "admin/updatePromo",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await adminService.updatePromo(id, payload);
      return res.data.data.promo;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Cập nhật mã ưu đãi thất bại");
    }
  }
);

export const deletePromoThunk = createAsyncThunk(
  "admin/deletePromo",
  async (id, { rejectWithValue }) => {
    try {
      const res = await adminService.deletePromo(id);
      return res.data.data.promo;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Xóa mã ưu đãi thất bại");
    }
  }
);

// ──────────────────────────── Subject (môn học) ────────────────────────────

export const getSubjectsThunk = createAsyncThunk(
  "admin/getSubjects",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await adminService.getSubjects(params);
      return res.data.data.subjects;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không lấy được danh sách môn học");
    }
  }
);

export const createSubjectThunk = createAsyncThunk(
  "admin/createSubject",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await adminService.createSubject(payload);
      return res.data.data.subject;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Thêm môn học thất bại");
    }
  }
);

export const updateSubjectThunk = createAsyncThunk(
  "admin/updateSubject",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await adminService.updateSubject(id, payload);
      return res.data.data.subject;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Cập nhật môn học thất bại");
    }
  }
);

// ──────────────────────────── Review (đánh giá gia sư) ────────────────────────────

export const getReviewTutorsThunk = createAsyncThunk(
  "admin/getReviewTutors",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await adminService.getReviewTutors(params);
      return res.data.data; // { tutors, pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không lấy được danh sách gia sư");
    }
  }
);

export const getAdminTutorReviewsThunk = createAsyncThunk(
  "admin/getTutorReviews",
  async ({ tutorId, params }, { rejectWithValue }) => {
    try {
      const res = await adminService.getTutorReviews(tutorId, params);
      return res.data.data; // { tutor, reviews, pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không lấy được danh sách đánh giá");
    }
  }
);

export const deleteReviewThunk = createAsyncThunk(
  "admin/deleteReview",
  async (id, { rejectWithValue }) => {
    try {
      await adminService.deleteReview(id);
      return { id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Xóa đánh giá thất bại");
    }
  }
);
