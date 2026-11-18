import axiosInstance from "@/services/axiosInstance";
import API_ENDPOINTS from "@/constants/apiEndpoints";

const attendanceService = {
  getClassOverview: (classId, params) =>
    axiosInstance.get(API_ENDPOINTS.ATTENDANCE.CLASS_OVERVIEW(classId), { params }),

  getClassSessions: (classId, params) =>
    axiosInstance.get(API_ENDPOINTS.ATTENDANCE.CLASS_SESSIONS(classId), { params }),

  getSessionDetail: (id) => axiosInstance.get(API_ENDPOINTS.ATTENDANCE.SESSION_DETAIL(id)),

  checkIn: (classId, file) => {
    const formData = new FormData();
    formData.append("photo", file);
    return axiosInstance.post(API_ENDPOINTS.ATTENDANCE.CHECK_IN(classId), formData, {
      headers: { "Content-Type": undefined },
    });
  },

  confirmCheckIn: (id) => axiosInstance.patch(API_ENDPOINTS.ATTENDANCE.CONFIRM_CHECKIN(id)),

  rejectCheckIn: (id, reason) =>
    axiosInstance.patch(API_ENDPOINTS.ATTENDANCE.REJECT_CHECKIN(id), { reason }),

  checkOut: (id, file) => {
    const formData = new FormData();
    formData.append("photo", file);
    return axiosInstance.post(API_ENDPOINTS.ATTENDANCE.CHECK_OUT(id), formData, {
      headers: { "Content-Type": undefined },
    });
  },

  confirmCheckOut: (id) => axiosInstance.patch(API_ENDPOINTS.ATTENDANCE.CONFIRM_CHECKOUT(id)),

  rejectCheckOut: (id, reason) =>
    axiosInstance.patch(API_ENDPOINTS.ATTENDANCE.REJECT_CHECKOUT(id), { reason }),

  openDispute: (id, payload) => axiosInstance.post(API_ENDPOINTS.ATTENDANCE.DISPUTE(id), payload),

  // Admin
  getAdminSessions: (params) =>
    axiosInstance.get(API_ENDPOINTS.ATTENDANCE.ADMIN_SESSIONS, { params }),

  adminConfirmOnBehalf: (id, payload) =>
    axiosInstance.patch(API_ENDPOINTS.ATTENDANCE.ADMIN_CONFIRM_ON_BEHALF(id), payload),

  adminResolveSession: (id, payload) =>
    axiosInstance.patch(API_ENDPOINTS.ATTENDANCE.ADMIN_RESOLVE(id), payload),

  adminInitPeriod: (classId, payload = {}) =>
    axiosInstance.post(API_ENDPOINTS.ATTENDANCE.ADMIN_INIT_PERIOD(classId), payload),
};

export default attendanceService;
