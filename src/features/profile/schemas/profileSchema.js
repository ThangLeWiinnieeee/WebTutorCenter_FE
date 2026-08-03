import { z } from "zod";

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(100, "Họ tên không được vượt quá 100 ký tự"),
  phone: z
    .string()
    .min(1, "Số điện thoại là bắt buộc")
    .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, "Số điện thoại không hợp lệ (VD: 0912345678)"),
  gender: z.enum(["male", "female", "other", ""]).optional(),
  dateOfBirth: z.string().min(1, "Ngày sinh là bắt buộc"),
});
