import API_ENDPOINTS from "@/constants/apiEndpoints";
import axiosInstance from "@/services/axiosInstance";

const paymentService = {
  // Danh sách cổng thanh toán đã cấu hình để gia sư chọn
  providers: () => axiosInstance.get(API_ENDPOINTS.PAYMENTS.PROVIDERS),
  // Khởi tạo thanh toán phí nhận lớp qua 1 cổng → trả { paymentUrl, amount, provider } để redirect
  initiateClassFee: (applicationId, provider) =>
    axiosInstance.post(API_ENDPOINTS.PAYMENTS.CLASS_FEE, { applicationId, provider }),
  // Lịch sử hóa đơn thanh toán phí nhận lớp của gia sư
  mine: (params) => axiosInstance.get(API_ENDPOINTS.PAYMENTS.MINE, { params }),
};

export default paymentService;
