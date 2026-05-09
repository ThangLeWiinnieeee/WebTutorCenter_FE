import { z } from "zod";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const classRequestSchema = z.object({
  subject: z.string().min(1, "Vui lòng chọn môn học"),
  grade: z.string().min(1, "Vui lòng nhập lớp"),
  studentCount: z.coerce.number().int().min(1, "Tối thiểu 1 học viên").max(20, "Tối đa 20 học viên"),
  tutorGenderPreference: z.enum(["male", "female", "other", "any"]),
  tutorLevelPreference: z.enum(["student", "teacher", "any"]),
  provinceCode: z.coerce.number().int().min(1, "Vui lòng chọn tỉnh/thành"),
  districtCode: z.coerce.number().int().min(1, "Vui lòng chọn quận/huyện"),
  addressDetail: z.string().min(5, "Vui lòng nhập địa chỉ chi tiết"),
  contactPhone: z
    .string()
    .regex(/^(84|0)(3|5|7|8|9)[0-9]{8}$/, "Số điện thoại không hợp lệ"),
  note: z.string().max(1000, "Ghi chú quá dài").optional().or(z.literal("")),
  sessionsPerWeek: z.coerce.number().int().min(1, "Ít nhất 1 buổi/tuần").max(7, "Tối đa 7 buổi/tuần"),
  sessionDurationMinutes: z.coerce
    .number()
    .int()
    .min(60, "Thời lượng tối thiểu 60 phút")
    .max(240, "Thời lượng tối đa 240 phút"),
  weeklyHours: z
    .array(
      z.object({
        day: z.enum(DAYS),
        hour: z.number().int().min(0).max(23),
      })
    )
    .min(1, "Vui lòng chọn ít nhất 1 khung giờ"),
});
