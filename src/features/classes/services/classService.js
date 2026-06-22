import API_ENDPOINTS from '@/constants/apiEndpoints';
import axiosInstance from '@/services/axiosInstance';

const classService = {
  quote: (payload) => axiosInstance.post(API_ENDPOINTS.CLASSES.QUOTE, payload),
  create: (payload) => axiosInstance.post(API_ENDPOINTS.CLASSES.CREATE, payload),
  list: (params) => axiosInstance.get(API_ENDPOINTS.CLASSES.LIST, { params }),
  subjects: () => axiosInstance.get(API_ENDPOINTS.CLASSES.SUBJECTS),
  pricingConfig: () => axiosInstance.get(API_ENDPOINTS.CLASSES.PRICING_CONFIG),
  detail: (id) => axiosInstance.get(API_ENDPOINTS.CLASSES.DETAIL(id)),
  mine: (params) => axiosInstance.get(API_ENDPOINTS.CLASSES.MINE, { params }),
  feed: (params) => axiosInstance.get(API_ENDPOINTS.CLASSES.FEED, { params }),
  myPosts: (params) => axiosInstance.get(API_ENDPOINTS.CLASSES.MY_POSTS, { params }),
  apply: (id) => axiosInstance.post(API_ENDPOINTS.CLASSES.APPLY(id)),
  validatePromo: (code, amount) =>
    axiosInstance.post(API_ENDPOINTS.PROMOS.VALIDATE, { code, amount }),
};

export default classService;
