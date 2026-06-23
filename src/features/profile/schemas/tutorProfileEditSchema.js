import { z } from "zod";
import { DAYS_OF_WEEK } from "@/constants/enums";

// Khung giờ giảng dạy dùng shape {day, hour} (khớp model + AvailabilityPicker/WeeklyHourGrid).
const availabilitySlotSchema = z.object({
  day: z.enum(DAYS_OF_WEEK),
  hour: z.number().int().min(0).max(23),
});

// Schema cho form sửa hồ sơ gia sư — chỉ các field được phép đổi (qua duyệt admin).
export const tutorProfileEditSchema = z.object({
  phone: z
    .string()
    .min(1, "Số điện thoại là bắt buộc")
    .regex(/^(84|0)(3|5|7|8|9)[0-9]{8}$/, "Số điện thoại không hợp lệ (VD: 0912345678)"),
  occupationStatus: z.enum(["student", "graduated", "teacher"], {
    message: "Vui lòng chọn tình trạng nghề nghiệp",
  }),
  teachingAreas: z.object({
    province: z.number().int().min(1, "Vui lòng chọn tỉnh/thành"),
    districts: z.array(z.number().int()).min(1, "Phải chọn ít nhất 1 quận/huyện"),
  }),
  currentArea: z.object({
    province: z.number().int().min(1, "Vui lòng chọn tỉnh/thành"),
    district: z.number().int().min(1, "Vui lòng chọn quận/huyện"),
  }),
  bio: z
    .string()
    .min(10, "Giới thiệu bản thân phải có ít nhất 10 ký tự")
    .max(2000, "Giới thiệu bản thân không được vượt quá 2000 ký tự"),
  availability: z.array(availabilitySlotSchema).min(1, "Phải có ít nhất 1 khung giờ giảng dạy"),
  subjects: z.array(z.string()).min(1, "Phải chọn ít nhất 1 môn học"),
  graduationYear: z
    .union([
      z
        .number()
        .int()
        .min(1950, "Năm tốt nghiệp phải từ 1950 trở lên")
        .max(new Date().getFullYear(), `Năm tốt nghiệp không được lớn hơn ${new Date().getFullYear()}`),
      z.null(),
      z.literal(""),
    ])
    .optional()
    .transform((v) => (v === "" ? null : v)),
}).superRefine((data, ctx) => {
  // Đã tốt nghiệp / giáo viên → năm tốt nghiệp là bắt buộc
  if (data.occupationStatus !== "student" && data.graduationYear == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["graduationYear"],
      message: "Vui lòng nhập năm tốt nghiệp",
    });
  }
});

// Chuyển hồ sơ gia sư (đã resolve tên khu vực) → giá trị mặc định cho form (mã số).
export const tutorProfileToFormValues = (profile) => ({
  phone: profile?.phone ?? "",
  occupationStatus: profile?.occupationStatus ?? "",
  teachingAreas: {
    province: profile?.teachingAreas?.province ?? 0,
    districts: (profile?.teachingAreas?.districts ?? []).map((d) => d.code ?? d).filter((c) => c != null),
  },
  currentArea: {
    province: profile?.currentArea?.province ?? 0,
    district: profile?.currentArea?.district ?? 0,
  },
  bio: profile?.bio ?? "",
  availability: (profile?.availability ?? []).map((s) => ({ day: s.day, hour: Number(s.hour) })),
  subjects: profile?.subjects ?? [],
  graduationYear: profile?.graduationYear ?? null,
});

// Chỉ giữ lại các field thực sự thay đổi so với giá trị gốc (so sánh sâu đơn giản).
export const diffTutorProfileChanges = (current, next) => {
  const changes = {};
  for (const key of Object.keys(next)) {
    if (JSON.stringify(current[key]) !== JSON.stringify(next[key])) {
      changes[key] = next[key];
    }
  }
  return changes;
};
