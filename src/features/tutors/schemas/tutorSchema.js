import { z } from "zod";

const availabilitySlotSchema = z
  .object({
    day: z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], {
      message: "Ngày không hợp lệ",
    }),
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Giờ bắt đầu phải theo định dạng HH:mm"),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Giờ kết thúc phải theo định dạng HH:mm"),
  })
  .refine((slot) => slot.endTime > slot.startTime, {
    message: "Giờ kết thúc phải sau giờ bắt đầu",
    path: ["endTime"],
  });

export const tutorSchema = z.object({
  phone: z
    .string()
    .min(1, "Số điện thoại là bắt buộc")
    .regex(/^(84|0)(3|5|7|8|9)[0-9]{8}$/, "Số điện thoại không hợp lệ (VD: 0912345678)"),

  subjects: z
    .array(z.string())
    .min(1, "Phải chọn ít nhất 1 môn học"),

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

  schoolName: z
    .string()
    .min(2, "Tên trường phải có ít nhất 2 ký tự")
    .max(200, "Tên trường không được vượt quá 200 ký tự"),

  graduationYear: z
    .union([
      z.number().int().min(1950, "Năm tốt nghiệp phải từ 1950 trở lên").max(new Date().getFullYear(), `Năm tốt nghiệp không được lớn hơn ${new Date().getFullYear()}`),
      z.null(),
      z.literal(""),
    ])
    .optional()
    .transform((v) => (v === "" ? null : v)),

  bio: z
    .string()
    .min(10, "Giới thiệu bản thân phải có ít nhất 10 ký tự")
    .max(2000, "Giới thiệu bản thân không được vượt quá 2000 ký tự"),

  availability: z.array(availabilitySlotSchema).min(1, "Phải có ít nhất 1 khung giờ giảng dạy"),
});
