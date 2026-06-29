import { z } from "zod";

// Form đánh giá gia sư: chọn sao (1-5) + nhận xét tối thiểu 5 ký tự
export const reviewSchema = z.object({
  rating: z
    .number({ invalid_type_error: "Vui lòng chọn số sao đánh giá" })
    .int()
    .min(1, "Vui lòng chọn số sao đánh giá")
    .max(5, "Số sao tối đa là 5"),
  comment: z
    .string()
    .trim()
    .min(5, "Nhận xét phải có ít nhất 5 ký tự")
    .max(1000, "Nhận xét không được vượt quá 1000 ký tự"),
});

// Form gia sư phản hồi đánh giá (chỉ được gửi 1 lần cho mỗi đánh giá)
export const reviewReplySchema = z.object({
  comment: z
    .string()
    .trim()
    .min(2, "Phản hồi phải có ít nhất 2 ký tự")
    .max(1000, "Phản hồi không được vượt quá 1000 ký tự"),
});
