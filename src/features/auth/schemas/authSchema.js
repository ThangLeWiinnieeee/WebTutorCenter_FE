import { z } from 'zod';

const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Họ tên không được để trống")
      .min(2, "Họ tên phải có ít nhất 2 ký tự")
      .max(100, "Họ tên không được vượt quá 100 ký tự"),
    email: z
      .string()
      .min(1, "Thư điện tử không được để trống")
      .email("Thư điện tử không hợp lệ"),
    phone: z
      .string()
      .min(1, "Số điện thoại không được để trống")
      .regex(phoneRegex, "Số điện thoại không hợp lệ (phải là số VN 10 số)"),
    dateOfBirth: z
      .string()
      .min(1, "Ngày sinh là bắt buộc")
      .refine((val) => !isNaN(Date.parse(val)), "Ngày sinh không hợp lệ")
      .refine(
        (val) => new Date(val) <= new Date(),
        "Ngày sinh không được lớn hơn thời gian hiện tại"
      ),
    password: z
      .string()
      .min(1, "Mật khẩu không được để trống")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Mật khẩu xác nhận không được để trống"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Thư điện tử không được để trống")
    .email("Thư điện tử không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .min(1, "Mã OTP không được để trống")
    .length(6, "Mã OTP phải có đúng 6 chữ số")
    .regex(/^\d+$/, "Mã OTP chỉ gồm các chữ số"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Thư điện tử không được để trống")
    .email("Thư điện tử không hợp lệ"),
});

export const verifyForgotPasswordOtpSchema = z.object({
  otp: z
    .string()
    .min(1, "Mã OTP không được để trống")
    .length(6, "Mã OTP phải có đúng 6 chữ số")
    .regex(/^\d+$/, "Mã OTP chỉ gồm các chữ số"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, "Mật khẩu không được để trống")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Mật khẩu xác nhận không được để trống"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });
