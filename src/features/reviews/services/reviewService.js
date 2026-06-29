import axiosInstance from "@/services/axiosInstance";
import API_ENDPOINTS from "@/constants/apiEndpoints";

const reviewService = {
  // Người đăng tạo đánh giá gia sư cho một lớp đã hoàn thành
  createReview: (payload) => axiosInstance.post(API_ENDPOINTS.REVIEWS.CREATE, payload),

  // Danh sách đánh giá công khai của một gia sư (có phân trang)
  getTutorReviews: (tutorId, params) =>
    axiosInstance.get(API_ENDPOINTS.REVIEWS.BY_TUTOR(tutorId), { params }),

  // Gia sư phản hồi một đánh giá của chính mình (chỉ 1 lần)
  replyToReview: (id, payload) => axiosInstance.post(API_ENDPOINTS.REVIEWS.REPLY(id), payload),
};

export default reviewService;
