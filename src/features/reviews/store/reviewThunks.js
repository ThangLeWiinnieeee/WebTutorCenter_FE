import { createApiThunk } from "@/app/createApiThunk";
import reviewService from "@/features/reviews/services/reviewService";

// Người đăng gửi đánh giá gia sư
export const createReviewThunk = createApiThunk(
  "reviews/create",
  async (payload) => {
    const res = await reviewService.createReview(payload);
    return res.data.data;
  },
  "Gửi đánh giá thất bại",
);

// Gia sư phản hồi một đánh giá của chính mình (chỉ 1 lần)
export const replyToReviewThunk = createApiThunk(
  "reviews/reply",
  async ({ reviewId, comment }) => {
    const res = await reviewService.replyToReview(reviewId, { comment });
    return res.data.data; // { review }
  },
  "Gửi phản hồi thất bại",
);
