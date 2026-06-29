import { createAsyncThunk } from "@reduxjs/toolkit";
import reviewService from "@/features/reviews/services/reviewService";

// Người đăng gửi đánh giá gia sư
export const createReviewThunk = createAsyncThunk(
  "reviews/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await reviewService.createReview(payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Gửi đánh giá thất bại");
    }
  }
);

// Gia sư phản hồi một đánh giá của chính mình (chỉ 1 lần)
export const replyToReviewThunk = createAsyncThunk(
  "reviews/reply",
  async ({ reviewId, comment }, { rejectWithValue }) => {
    try {
      const res = await reviewService.replyToReview(reviewId, { comment });
      return res.data.data; // { review }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Gửi phản hồi thất bại");
    }
  }
);
