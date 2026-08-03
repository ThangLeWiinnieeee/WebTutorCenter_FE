import { createApiThunk } from "@/app/createApiThunk";
import classService from "@/features/classes/services/classService";

// Báo giá học phí cho lớp sắp đăng (có thể áp mã ưu đãi).
export const quoteClassThunk = createApiThunk(
  "classes/quote",
  async (payload) => {
    const res = await classService.quote(payload);
    return res.data.data;
  },
  "Không tính được học phí",
);

// Đăng một bài tìm gia sư mới.
export const createClassThunk = createApiThunk(
  "classes/create",
  async (payload) => {
    const res = await classService.create(payload);
    return res.data.data.classItem;
  },
  "Không đăng được lớp cần gia sư",
);

// Cập nhật một bài đăng lớp.
export const updateClassThunk = createApiThunk(
  "classes/update",
  async ({ id, payload }) => {
    const res = await classService.update(id, payload);
    return res.data.data.classItem;
  },
  "Cập nhật bài đăng thất bại",
);

// Xóa mềm một bài đăng lớp.
export const deleteClassThunk = createApiThunk(
  "classes/delete",
  async (id) => {
    await classService.remove(id);
    return id;
  },
  "Xóa bài đăng thất bại",
);

// Lấy danh sách lớp công khai theo bộ lọc.
export const fetchClassesThunk = createApiThunk(
  "classes/fetchList",
  async (filters = {}) => {
    const res = await classService.list(filters);
    return {
      classes: res.data.data.classes || [],
      pagination: res.data.data.pagination || null,
    };
  },
  "Không tải được danh sách lớp",
);

// Lấy chi tiết một lớp.
export const fetchClassDetailThunk = createApiThunk(
  "classes/fetchDetail",
  async (id) => {
    const res = await classService.detail(id);
    return res.data.data.classItem;
  },
  "Không tải được chi tiết lớp",
);

// Lấy các đơn nhận lớp của gia sư hiện tại.
export const fetchMyClassesThunk = createApiThunk(
  "classes/fetchMine",
  async (params = {}) => {
    const res = await classService.mine(params);
    return res.data.data;
  },
  "Không tải được danh sách lớp đã nhận",
);

// Lấy danh sách lớp gợi ý theo môn cho gia sư.
export const fetchClassFeedThunk = createApiThunk(
  "classes/fetchFeed",
  async (params = {}) => {
    const res = await classService.feed(params);
    return res.data.data;
  },
  "Không tải được bài đăng theo môn",
);

// Lấy các bài đăng lớp của người dùng hiện tại.
export const fetchMyPostsThunk = createApiThunk(
  "classes/fetchMyPosts",
  async (params = {}) => {
    const res = await classService.myPosts(params);
    return res.data.data;
  },
  "Không tải được danh sách bài đăng",
);

// Gia sư gửi yêu cầu hủy đơn đã nhận lớp.
export const cancelApplicationThunk = createApiThunk(
  "classes/cancelApplication",
  async ({ id, reason }) => {
    const res = await classService.cancelApplication(id, reason);
    return res.data.data.application;
  },
  "Hủy đơn thất bại",
);

// Xác nhận đã hoàn thành lớp (cần cả hai phía xác nhận).
export const completeClassThunk = createApiThunk(
  "classes/complete",
  async (id) => {
    const res = await classService.completeClass(id);
    return res.data.data.classItem;
  },
  "Xác nhận hoàn thành thất bại",
);

// Gia sư ứng tuyển nhận một lớp.
export const applyForClassThunk = createApiThunk(
  "classes/apply",
  async (classId) => {
    const res = await classService.apply(classId);
    return res.data.data.application;
  },
  "Không thể gửi yêu cầu nhận lớp",
);

// Người đăng lấy danh sách gia sư ứng tuyển một bài đăng của mình
export const fetchApplicantsThunk = createApiThunk(
  "classes/fetchApplicants",
  async (classId) => {
    const res = await classService.getApplicants(classId);
    return res.data.data; // { classItem, applicants }
  },
  "Không tải được danh sách gia sư ứng tuyển",
);

// Người đăng chọn 1 gia sư
export const selectApplicantThunk = createApiThunk(
  "classes/selectApplicant",
  async ({ classId, applicationId }) => {
    const res = await classService.selectApplicant(classId, applicationId);
    return res.data.data.application;
  },
  "Không thể chọn gia sư",
);

// ── Mời gia sư trực tiếp ──

// Người đăng tạo lớp + mời một gia sư cụ thể
export const createInvitedClassThunk = createApiThunk(
  "classes/createInvite",
  async (payload) => {
    const res = await classService.createInvite(payload);
    return res.data.data.classItem;
  },
  "Không gửi được lời mời tới gia sư",
);

// Gia sư lấy danh sách lời mời dạy lớp
export const fetchInvitationsThunk = createApiThunk(
  "classes/fetchInvitations",
  async (params = {}) => {
    const res = await classService.getInvitations(params);
    return res.data.data; // { invitations, pagination }
  },
  "Không tải được danh sách lời mời",
);

// Gia sư đồng ý lời mời
export const acceptInvitationThunk = createApiThunk(
  "classes/acceptInvitation",
  async (applicationId) => {
    const res = await classService.acceptInvitation(applicationId);
    return res.data.data.application;
  },
  "Không thể đồng ý lời mời",
);

// Gia sư từ chối lời mời (kèm lý do)
export const declineInvitationThunk = createApiThunk(
  "classes/declineInvitation",
  async ({ applicationId, reason }) => {
    const res = await classService.declineInvitation(applicationId, reason);
    return res.data.data.application;
  },
  "Không thể từ chối lời mời",
);
