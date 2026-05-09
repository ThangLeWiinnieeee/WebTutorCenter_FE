import API_ENDPOINTS from '@/constants/apiEndpoints';
import axiosInstance from '@/services/axiosInstance';

const classService = {
  quote: (payload) => axiosInstance.post(API_ENDPOINTS.CLASSES.QUOTE, payload),
  create: (payload) => axiosInstance.post(API_ENDPOINTS.CLASSES.CREATE, payload),
  list: (params) => axiosInstance.get(API_ENDPOINTS.CLASSES.LIST, { params }),
  subjects: () => axiosInstance.get(API_ENDPOINTS.CLASSES.SUBJECTS),
  detail: (id) => axiosInstance.get(API_ENDPOINTS.CLASSES.DETAIL(id)),
};

export default classService;
