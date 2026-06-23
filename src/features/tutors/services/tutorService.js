import axiosInstance from "@/services/axiosInstance";
import API_ENDPOINTS from "@/constants/apiEndpoints";

const tutorService = {
  register: (data) => axiosInstance.post(API_ENDPOINTS.TUTORS.REGISTER, data),
  getProfile: () => axiosInstance.get(API_ENDPOINTS.TUTORS.GET_PROFILE),
  
  // Danh sách và search
  getActiveTutors: (page = 1, limit = 10) =>
    axiosInstance.get(API_ENDPOINTS.TUTORS.GET_ACTIVE, {
      params: { page, limit },
    }),
  
  getTopTutors: (limit = 10) =>
    axiosInstance.get(API_ENDPOINTS.TUTORS.GET_TOP, { params: { limit } }),
  
  getTopTutorsThisMonth: (limit = 10) =>
    axiosInstance.get(API_ENDPOINTS.TUTORS.GET_TOP_THIS_MONTH, { params: { limit } }),
  
  getNewTutors: (days = 30, limit = 10) =>
    axiosInstance.get(API_ENDPOINTS.TUTORS.GET_NEW, {
      params: { days, limit },
    }),
  
  searchTutors: (filters = {}, page = 1, limit = 10) =>
    axiosInstance.get(API_ENDPOINTS.TUTORS.SEARCH, {
      params: { ...filters, page, limit },
    }),

  getTutorById: (id) => axiosInstance.get(API_ENDPOINTS.TUTORS.GET_BY_ID(id)),

  // Gia sư đổi hồ sơ (chờ admin duyệt)
  getMyProfileChangeRequest: () => axiosInstance.get(API_ENDPOINTS.TUTORS.PROFILE_CHANGE_REQUEST),
  requestProfileChange: (data) => axiosInstance.post(API_ENDPOINTS.TUTORS.PROFILE_CHANGE_REQUEST, data),
};

export default tutorService;
