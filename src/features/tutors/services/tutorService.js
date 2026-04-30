import axiosInstance from "@/services/axiosInstance";
import API_ENDPOINTS from "@/constants/apiEndpoints";

const tutorService = {
  register: (data) => axiosInstance.post(API_ENDPOINTS.TUTORS.REGISTER, data),
  getProfile: () => axiosInstance.get(API_ENDPOINTS.TUTORS.GET_PROFILE),
};

export default tutorService;
