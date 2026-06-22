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
  getAdminClasses: (params) => axiosInstance.get(API_ENDPOINTS.ADMIN.CLASSES, { params }),
  getAdminClassDetail: (id) => axiosInstance.get(API_ENDPOINTS.ADMIN.CLASS_DETAIL(id)),
  deleteAdminClass: (id) => axiosInstance.delete(API_ENDPOINTS.ADMIN.CLASS_DELETE(id)),
  getTrashCounts: () => axiosInstance.get(API_ENDPOINTS.ADMIN.TRASH_COUNTS),
  getTrashItems: (type, params) => axiosInstance.get(API_ENDPOINTS.ADMIN.TRASH_LIST(type), { params }),
  restoreTrashItem: (type, id) => axiosInstance.patch(API_ENDPOINTS.ADMIN.TRASH_RESTORE(type, id)),
  purgeTrashItem: (type, id) => axiosInstance.delete(API_ENDPOINTS.ADMIN.TRASH_PURGE(type, id)),
  getPromos: (params) => axiosInstance.get(API_ENDPOINTS.PROMOS.LIST, { params }),
  createPromo: (payload) => axiosInstance.post(API_ENDPOINTS.PROMOS.CREATE, payload),
  updatePromo: (id, payload) => axiosInstance.patch(API_ENDPOINTS.PROMOS.UPDATE(id), payload),
  deletePromo: (id) => axiosInstance.delete(API_ENDPOINTS.PROMOS.DELETE(id)),
};

export default adminService;
