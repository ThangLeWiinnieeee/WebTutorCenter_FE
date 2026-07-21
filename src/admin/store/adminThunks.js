import { createApiThunk } from "@/app/createApiThunk";
import adminService from "@/admin/services/adminService";

// Lấy số liệu tổng quan cho trang dashboard admin.
export const getDashboardStatsThunk = createApiThunk(
  "admin/getDashboardStats",
  async () => {
    const res = await adminService.getDashboardStats();
    return res.data.data.stats;
  },
  "Không lấy được thống kê",
);

// Lấy danh sách hồ sơ gia sư đang chờ duyệt.
export const getPendingTutorsThunk = createApiThunk(
  "admin/getPendingTutors",
  async (params = {}) => {
    const res = await adminService.getPendingTutors(params);
    return res.data.data; // { tutors, pagination }
  },
  "Không lấy được danh sách",
);

// Duyệt hồ sơ gia sư.
export const approveTutorThunk = createApiThunk(
  "admin/approveTutor",
  async (id) => {
    const res = await adminService.approveTutor(id);
    return res.data.data.tutor;
  },
  "Phê duyệt thất bại",
);

// Từ chối hồ sơ gia sư kèm lý do.
export const rejectTutorThunk = createApiThunk(
  "admin/rejectTutor",
  async ({ id, rejectionReason }) => {
    const res = await adminService.rejectTutor(id, rejectionReason);
    return res.data.data.tutor;
  },
  "Từ chối thất bại",
);

// Lấy danh sách người dùng có phân trang/lọc.
export const getAdminUsersThunk = createApiThunk(
  "admin/getUsers",
  async (params) => {
    const res = await adminService.getUsers(params);
    return res.data.data;
  },
  "Không lấy được danh sách người dùng",
);

// Cập nhật thông tin một người dùng.
export const updateAdminUserThunk = createApiThunk(
  "admin/updateUser",
  async ({ id, payload }) => {
    const res = await adminService.updateUser(id, payload);
    return res.data.data.user;
  },
  "Cập nhật người dùng thất bại",
);

// Bật/tắt trạng thái hoạt động của người dùng.
export const updateAdminUserStatusThunk = createApiThunk(
  "admin/updateUserStatus",
  async ({ id, isActive }) => {
    const res = await adminService.updateUserStatus(id, isActive);
    return res.data.data.user;
  },
  "Cập nhật trạng thái người dùng thất bại",
);

// Xóa mềm người dùng (đưa vào thùng rác).
export const softDeleteAdminUserThunk = createApiThunk(
  "admin/deleteUser",
  async (id) => {
    const res = await adminService.deleteUser(id);
    return res.data.data.user;
  },
  "Xóa người dùng thất bại",
);

// Lấy danh sách đơn nhận lớp / lời mời dạy.
export const getClassApplicationsThunk = createApiThunk(
  "admin/getClassApplications",
  async (params = {}) => {
    const res = await adminService.getClassApplications(params);
    return res.data.data; // { applications, pagination, counts }
  },
  "Không lấy được danh sách đơn đăng ký",
);

// Lấy số lượng đơn nhận lớp theo từng trạng thái.
export const getClassApplicationStatsThunk = createApiThunk(
  "admin/getClassApplicationStats",
  async (params = {}) => {
    const res = await adminService.getClassApplicationStats(params);
    return res.data.data.stats;
  },
  "Không lấy được thống kê đơn đăng ký",
);

// Số đơn "chờ duyệt" (status selected) cho CẢ 2 mục origin để hiện badge trên 2 tab.
export const getClassApplicationOriginCountsThunk = createApiThunk(
  "admin/getClassApplicationOriginCounts",
  async () => {
    const [applyRes, inviteRes] = await Promise.all([
      adminService.getClassApplicationStats({ origin: "apply" }),
      adminService.getClassApplicationStats({ origin: "invite" }),
    ]);
    return {
      apply: applyRes.data.data.stats.selected ?? 0,
      invite: inviteRes.data.data.stats.selected ?? 0,
    };
  },
  "Không lấy được số đơn chờ duyệt",
);

// Duyệt đơn nhận lớp.
export const approveClassApplicationThunk = createApiThunk(
  "admin/approveClassApplication",
  async (id) => {
    const res = await adminService.approveClassApplication(id);
    return res.data.data.application;
  },
  "Duyệt đơn thất bại",
);

// Từ chối đơn nhận lớp kèm lý do.
export const rejectClassApplicationThunk = createApiThunk(
  "admin/rejectClassApplication",
  async ({ id, rejectionReason }) => {
    const res = await adminService.rejectClassApplication(id, rejectionReason);
    return res.data.data.application;
  },
  "Từ chối đơn thất bại",
);

// ──────────────────────────── Class (bài đăng tìm gia sư) ────────────────────────────

// Lấy danh sách bài đăng lớp cho khu vực admin.
export const getAdminClassesThunk = createApiThunk(
  "admin/getClasses",
  async (params) => {
    const res = await adminService.getAdminClasses(params);
    return res.data.data;
  },
  "Không lấy được danh sách bài đăng",
);

// Xóa mềm một bài đăng lớp.
export const deleteAdminClassThunk = createApiThunk(
  "admin/deleteClass",
  async (id) => {
    await adminService.deleteAdminClass(id);
    return { id };
  },
  "Xóa bài đăng thất bại",
);

// ──────────────────────────── Trash (thùng rác) ────────────────────────────

// Đếm số mục đã xóa mềm theo từng loại.
export const getTrashCountsThunk = createApiThunk(
  "admin/getTrashCounts",
  async () => {
    const res = await adminService.getTrashCounts();
    return res.data.data.counts;
  },
  "Không lấy được số lượng thùng rác",
);

// Lấy danh sách mục trong thùng rác theo loại.
export const getTrashItemsThunk = createApiThunk(
  "admin/getTrashItems",
  async ({ type, params }) => {
    const res = await adminService.getTrashItems(type, params);
    return res.data.data;
  },
  "Không lấy được danh sách thùng rác",
);

// Khôi phục một mục từ thùng rác.
export const restoreTrashItemThunk = createApiThunk(
  "admin/restoreTrashItem",
  async ({ type, id }) => {
    await adminService.restoreTrashItem(type, id);
    return { id };
  },
  "Khôi phục thất bại",
);

// Xóa vĩnh viễn một mục trong thùng rác.
export const purgeTrashItemThunk = createApiThunk(
  "admin/purgeTrashItem",
  async ({ type, id }) => {
    await adminService.purgeTrashItem(type, id);
    return { id };
  },
  "Xóa vĩnh viễn thất bại",
);

// ──────────────────────────── Profile change requests (gia sư đổi hồ sơ) ────────────────────────────

// Lấy danh sách yêu cầu đổi hồ sơ gia sư.
export const getProfileChangesThunk = createApiThunk(
  "admin/getProfileChanges",
  async (params = {}) => {
    const res = await adminService.getProfileChanges(params);
    return res.data.data; // { requests, pagination, counts }
  },
  "Không lấy được danh sách yêu cầu đổi thông tin",
);

// Duyệt yêu cầu đổi hồ sơ gia sư.
export const approveProfileChangeThunk = createApiThunk(
  "admin/approveProfileChange",
  async (id) => {
    const res = await adminService.approveProfileChange(id);
    return res.data.data.request;
  },
  "Duyệt yêu cầu thất bại",
);

// Từ chối yêu cầu đổi hồ sơ gia sư kèm lý do.
export const rejectProfileChangeThunk = createApiThunk(
  "admin/rejectProfileChange",
  async ({ id, rejectionReason }) => {
    const res = await adminService.rejectProfileChange(id, rejectionReason);
    return res.data.data.request;
  },
  "Từ chối yêu cầu thất bại",
);

// ──────────────────────────── Hủy đơn nhận lớp (gia sư rút đơn) ────────────────────────────

// Lấy danh sách yêu cầu hủy đơn nhận lớp.
export const getApplicationCancellationsThunk = createApiThunk(
  "admin/getApplicationCancellations",
  async (params = {}) => {
    const res = await adminService.getApplicationCancellations(params);
    return res.data.data; // { cancellations, pagination, counts }
  },
  "Không lấy được danh sách đơn hủy",
);

// Duyệt yêu cầu hủy đơn nhận lớp.
export const approveCancellationThunk = createApiThunk(
  "admin/approveCancellation",
  async (id) => {
    const res = await adminService.approveCancellation(id);
    return res.data.data.application;
  },
  "Duyệt hủy đơn thất bại",
);

// Từ chối yêu cầu hủy đơn nhận lớp kèm lý do.
export const rejectCancellationThunk = createApiThunk(
  "admin/rejectCancellation",
  async ({ id, rejectionReason }) => {
    const res = await adminService.rejectCancellation(id, rejectionReason);
    return res.data.data.application;
  },
  "Từ chối hủy đơn thất bại",
);

// ──────────────────────────── Promo (mã ưu đãi) ────────────────────────────

// Lấy danh sách mã ưu đãi.
export const getPromosThunk = createApiThunk(
  "admin/getPromos",
  async (params) => {
    const res = await adminService.getPromos(params);
    return res.data.data;
  },
  "Không lấy được danh sách mã ưu đãi",
);

// Tạo mã ưu đãi mới.
export const createPromoThunk = createApiThunk(
  "admin/createPromo",
  async (payload) => {
    const res = await adminService.createPromo(payload);
    return res.data.data.promo;
  },
  "Tạo mã ưu đãi thất bại",
);

// Cập nhật mã ưu đãi.
export const updatePromoThunk = createApiThunk(
  "admin/updatePromo",
  async ({ id, payload }) => {
    const res = await adminService.updatePromo(id, payload);
    return res.data.data.promo;
  },
  "Cập nhật mã ưu đãi thất bại",
);

// Xóa mềm mã ưu đãi.
export const deletePromoThunk = createApiThunk(
  "admin/deletePromo",
  async (id) => {
    const res = await adminService.deletePromo(id);
    return res.data.data.promo;
  },
  "Xóa mã ưu đãi thất bại",
);

// ──────────────────────────── Subject (môn học) ────────────────────────────

// Lấy danh mục môn học (bản dành cho admin).
export const getSubjectsThunk = createApiThunk(
  "admin/getSubjects",
  async (params = {}) => {
    const res = await adminService.getSubjects(params);
    return res.data.data.subjects;
  },
  "Không lấy được danh sách môn học",
);

// Tạo môn học mới.
export const createSubjectThunk = createApiThunk(
  "admin/createSubject",
  async (payload) => {
    const res = await adminService.createSubject(payload);
    return res.data.data.subject;
  },
  "Thêm môn học thất bại",
);

// Cập nhật môn học (đổi tên hoặc bật/tắt).
export const updateSubjectThunk = createApiThunk(
  "admin/updateSubject",
  async ({ id, payload }) => {
    const res = await adminService.updateSubject(id, payload);
    return res.data.data.subject;
  },
  "Cập nhật môn học thất bại",
);

// ──────────────────────────── Review (đánh giá gia sư) ────────────────────────────

// Lấy danh sách gia sư kèm thống kê đánh giá.
export const getReviewTutorsThunk = createApiThunk(
  "admin/getReviewTutors",
  async (params = {}) => {
    const res = await adminService.getReviewTutors(params);
    return res.data.data; // { tutors, pagination }
  },
  "Không lấy được danh sách gia sư",
);

// Lấy các đánh giá của một gia sư cụ thể.
export const getAdminTutorReviewsThunk = createApiThunk(
  "admin/getTutorReviews",
  async ({ tutorId, params }) => {
    const res = await adminService.getTutorReviews(tutorId, params);
    return res.data.data; // { tutor, reviews, pagination }
  },
  "Không lấy được danh sách đánh giá",
);

// Xóa mềm một đánh giá.
export const deleteReviewThunk = createApiThunk(
  "admin/deleteReview",
  async (id) => {
    await adminService.deleteReview(id);
    return { id };
  },
  "Xóa đánh giá thất bại",
);
