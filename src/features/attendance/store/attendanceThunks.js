import { createApiThunk } from "@/app/createApiThunk";
import attendanceService from "@/features/attendance/services/attendanceService";

export const fetchAttendanceOverviewThunk = createApiThunk(
  "attendance/fetchOverview",
  async ({ classId, periodId }) => {
    const res = await attendanceService.getClassOverview(
      classId,
      periodId ? { periodId } : undefined
    );
    return res.data.data;
  },
  "Không tải được thông tin điểm danh"
);

export const checkInSessionThunk = createApiThunk(
  "attendance/checkIn",
  async ({ classId, file }) => {
    const res = await attendanceService.checkIn(classId, file);
    return res.data.data;
  },
  "Gửi check-in thất bại"
);

export const confirmCheckInThunk = createApiThunk(
  "attendance/confirmCheckIn",
  async (sessionId) => {
    const res = await attendanceService.confirmCheckIn(sessionId);
    return res.data.data;
  },
  "Xác nhận bắt đầu buổi học thất bại"
);

export const rejectCheckInThunk = createApiThunk(
  "attendance/rejectCheckIn",
  async ({ sessionId, reason }) => {
    const res = await attendanceService.rejectCheckIn(sessionId, reason);
    return res.data.data;
  },
  "Từ chối check-in thất bại"
);

export const checkOutSessionThunk = createApiThunk(
  "attendance/checkOut",
  async ({ sessionId, file }) => {
    const res = await attendanceService.checkOut(sessionId, file);
    return res.data.data;
  },
  "Gửi check-out thất bại"
);

export const confirmCheckOutThunk = createApiThunk(
  "attendance/confirmCheckOut",
  async (sessionId) => {
    const res = await attendanceService.confirmCheckOut(sessionId);
    return res.data.data;
  },
  "Xác nhận kết thúc buổi học thất bại"
);

export const rejectCheckOutThunk = createApiThunk(
  "attendance/rejectCheckOut",
  async ({ sessionId, reason }) => {
    const res = await attendanceService.rejectCheckOut(sessionId, reason);
    return res.data.data;
  },
  "Từ chối check-out thất bại"
);

export const openDisputeThunk = createApiThunk(
  "attendance/openDispute",
  async ({ sessionId, reason }) => {
    const res = await attendanceService.openDispute(sessionId, { reason });
    return res.data.data;
  },
  "Gửi yêu cầu hỗ trợ thất bại"
);

// Admin thunks
export const fetchAdminAttendanceSessionsThunk = createApiThunk(
  "attendance/adminFetchSessions",
  async (params) => {
    const res = await attendanceService.getAdminSessions(params);
    return res.data.data;
  },
  "Không tải được danh sách buổi điểm danh"
);

export const adminConfirmOnBehalfThunk = createApiThunk(
  "attendance/adminConfirmOnBehalf",
  async ({ sessionId, payload }) => {
    const res = await attendanceService.adminConfirmOnBehalf(sessionId, payload);
    return res.data.data;
  },
  "Duyệt thay học viên thất bại"
);

export const adminResolveSessionThunk = createApiThunk(
  "attendance/adminResolveSession",
  async ({ sessionId, payload }) => {
    const res = await attendanceService.adminResolveSession(sessionId, payload);
    return res.data.data;
  },
  "Xử lý khiếu nại thất bại"
);

export const adminInitPeriodThunk = createApiThunk(
  "attendance/adminInitPeriod",
  async ({ classId, startDate }) => {
    const res = await attendanceService.adminInitPeriod(
      classId,
      startDate ? { startDate } : {}
    );
    return res.data.data;
  },
  "Khởi tạo kỳ điểm danh thất bại"
);
