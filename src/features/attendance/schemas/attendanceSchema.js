import { z } from "zod";

export const rejectSessionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Lý do từ chối phải có ít nhất 5 ký tự")
    .max(500, "Lý do từ chối không được vượt quá 500 ký tự"),
});

export const disputeSessionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "Nội dung phản ánh / yêu cầu hỗ trợ phải có ít nhất 10 ký tự")
    .max(1000, "Nội dung phản ánh không được vượt quá 1000 ký tự"),
});

export const adminConfirmOnBehalfSchema = z.object({
  action: z.enum([
    "VALIDATE_SESSION",
    "CONFIRM_CHECKIN_ON_BEHALF",
    "CONFIRM_CHECKOUT_ON_BEHALF",
  ]),
  reason: z
    .string()
    .trim()
    .min(5, "Vui lòng nhập lý do duyệt thay ít nhất 5 ký tự")
    .max(1000, "Lý do không được vượt quá 1000 ký tự"),
  verifiedDurationMinutes: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z
      .number({ invalid_type_error: "Thời lượng phải là số" })
      .int("Thời lượng phải là số nguyên")
      .min(1, "Thời lượng tối thiểu 1 phút")
      .max(600, "Thời lượng tối đa 600 phút")
      .optional()
  ),
});

export const adminResolveSessionSchema = z.object({
  decision: z.enum(["VALID", "INVALIDATED"], {
    required_error: "Vui lòng chọn kết luận xử lý",
  }),
  reason: z
    .string()
    .trim()
    .min(5, "Lý do kết luận phải có ít nhất 5 ký tự")
    .max(1000, "Lý do không được vượt quá 1000 ký tự"),
  verifiedDurationMinutes: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z
      .number({ invalid_type_error: "Thời lượng phải là số" })
      .int("Thời lượng phải là số nguyên")
      .min(0, "Thời lượng không âm")
      .max(600, "Thời lượng tối đa 600 phút")
      .optional()
  ),
});
