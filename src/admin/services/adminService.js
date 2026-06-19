import axiosInstance from "@/services/axiosInstance";
import API_ENDPOINTS from "@/constants/apiEndpoints";

const adminService = {
  getDashboardStats: () => axiosInstance.get(API_ENDPOINTS.ADMIN.DASHBOARD_STATS),
  getPendingTutors: () => axiosInstance.get(API_ENDPOINTS.ADMIN.TUTORS_PENDING),
  approveTutor: (id) => axiosInstance.patch(API_ENDPOINTS.ADMIN.TUTOR_APPROVE(id)),
  rejectTutor: (id, rejectionReason) =>
    axiosInstance.patch(API_ENDPOINTS.ADMIN.TUTOR_REJECT(id), { rejectionReason }),
  getUsers: (params) => axiosInstance.get(API_ENDPOINTS.ADMIN.USERS, { params }),
  updateUser: (id, payload) => axiosInstance.patch(API_ENDPOINTS.ADMIN.USER_UPDATE(id), payload),
  updateUserStatus: (id, isActive) =>
    axiosInstance.patch(API_ENDPOINTS.ADMIN.USER_STATUS(id), { isActive }),
  deleteUser: (id) => axiosInstance.delete(API_ENDPOINTS.ADMIN.USER_DELETE(id)),
  getClassApplications: (params) => axiosInstance.get(API_ENDPOINTS.ADMIN.CLASS_APPLICATIONS, { params }),
  getClassApplicationStats: () => axiosInstance.get(API_ENDPOINTS.ADMIN.CLASS_APPLICATIONS_STATS),
  approveClassApplication: (id) => axiosInstance.patch(API_ENDPOINTS.ADMIN.CLASS_APPLICATION_APPROVE(id)),
  rejectClassApplication: (id, rejectionReason) =>
    axiosInstance.patch(API_ENDPOINTS.ADMIN.CLASS_APPLICATION_REJECT(id), { rejectionReason }),
};

export default adminService;
