import { z } from "zod";

// Form mã ưu đãi (admin). Các field số/ngày để dạng chuỗi từ input, ép kiểu khi submit.
export const promoSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Mã phải có ít nhất 3 ký tự")
      .max(50, "Mã tối đa 50 ký tự"),
    description: z.string().trim().max(200, "Mô tả tối đa 200 ký tự").optional().or(z.literal("")),
    discountType: z.enum(["percent", "fixed"], { message: "Vui lòng chọn loại giảm giá" }),
    discountValue: z
      .string()
      .min(1, "Vui lòng nhập giá trị giảm")
      .refine((v) => Number(v) >= 0, "Giá trị giảm không hợp lệ"),
    maxDiscountAmount: z.string().optional().or(z.literal("")),
    usageLimit: z.string().optional().or(z.literal("")),
    startsAt: z.string().optional().or(z.literal("")),
    expiresAt: z.string().optional().or(z.literal("")),
    isActive: z.enum(["true", "false"]),
  })
  .refine(
    (data) => data.discountType !== "percent" || Number(data.discountValue) <= 100,
    { path: ["discountValue"], message: "Giảm theo % không được vượt quá 100" },
  )
  .refine(
    (data) => !data.startsAt || !data.expiresAt || new Date(data.startsAt) <= new Date(data.expiresAt),
    { path: ["expiresAt"], message: "Ngày hết hạn phải sau ngày bắt đầu" },
  );
