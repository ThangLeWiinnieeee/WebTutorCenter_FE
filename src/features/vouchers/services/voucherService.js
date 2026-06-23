import axiosInstance from "@/services/axiosInstance";
import API_ENDPOINTS from "@/constants/apiEndpoints";

const voucherService = {
  // Kho mã giảm giá của người dùng hiện tại
  getMyVouchers: (params) => axiosInstance.get(API_ENDPOINTS.PROMOS.MINE, { params }),
};

export default voucherService;
