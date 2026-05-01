import axiosInstance from "@/services/axiosInstance";
import API_ENDPOINTS from "@/constants/apiEndpoints";

const adminService = {
  getDashboardStats: () => axiosInstance.get(API_ENDPOINTS.ADMIN.DASHBOARD_STATS),
  getPendingTutors: () => axiosInstance.get(API_ENDPOINTS.ADMIN.TUTORS_PENDING),
  approveTutor: (id) => axiosInstance.patch(API_ENDPOINTS.ADMIN.TUTOR_APPROVE(id)),
  rejectTutor: (id, rejectionReason) =>
    axiosInstance.patch(API_ENDPOINTS.ADMIN.TUTOR_REJECT(id), { rejectionReason }),
};

export default adminService;
