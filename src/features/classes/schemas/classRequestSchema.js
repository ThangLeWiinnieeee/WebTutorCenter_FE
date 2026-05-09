import { z } from 'zod';

const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const availabilitySlotSchema = z.object({
  day: z.enum(dayOptions),
  hour: z.number().int().min(0).max(23),
});

const numberFromInput = (min, message) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) return undefined;
      return Number(value);
    },
    z.number().int().min(min, message)
  );

export const MINUTES_PER_SESSION_PRESETS = [60, 90, 120, 150, 180];

const minutesPerSessionSchema = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    return Number(value);
  },
  z
    .number()
    .int()
    .min(60, "Thời lượng tối thiểu 60 phút")
    .max(180, "Thời lượng tối đa 180 phút (3 giờ)")
    .refine((val) => MINUTES_PER_SESSION_PRESETS.includes(val), {
      message: "Vui lòng chọn một mức: 60, 90, 120, 150 hoặc 180 phút",
    }),
);

/** yyyy-mm-dd, local timezone, start-of-day comparison */
export const getTodayIsoDateLocal = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const startDateSchema = z
  .string()
  .min(1, "Vui lòng chọn ngày bắt đầu")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày bắt đầu không hợp lệ")
  .refine(
    (val) => {
      const [year, month, day] = val.split("-").map(Number);
      const picked = new Date(year, month - 1, day);
      if (Number.isNaN(picked.getTime())) return false;
      if (picked.getDate() !== day || picked.getMonth() !== month - 1) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      picked.setHours(0, 0, 0, 0);
      return picked >= today;
    },
    { message: "Ngày bắt đầu không được trước hôm nay" },
  );

export const classRequestSchema = z.object({
  contactPhone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(/^(84|0)(3|5|7|8|9)[0-9]{8}$/, "Số điện thoại không hợp lệ"),
  summary: z.string().min(10, "Tóm tắt cần ít nhất 10 ký tự").max(200, "Tóm tắt tối đa 200 ký tự"),
  description: z.string().min(20, "Mô tả cần ít nhất 20 ký tự").max(2000, "Mô tả tối đa 2000 ký tự"),
  subject: z.string().min(1, "Vui lòng chọn môn học"),
  studentGender: z.enum(["male", "female", "other"], { message: "Vui lòng chọn giới tính học viên" }),
  studentCount: numberFromInput(1, "Số học viên tối thiểu là 1"),
  startDate: startDateSchema,
  minutesPerSession: minutesPerSessionSchema,
  sessionsPerWeek: numberFromInput(1, "Số buổi học tối thiểu là 1"),
  provinceCode: numberFromInput(1, "Vui lòng chọn tỉnh/thành"),
  districtCode: numberFromInput(1, "Vui lòng chọn quận/huyện"),
  locationLabel: z.string().min(3, "Vui lòng nhập địa chỉ ngắn gọn").max(200, "Địa chỉ tối đa 200 ký tự"),
  availabilitySlots: z.array(availabilitySlotSchema).min(1, "Vui lòng chọn ít nhất 1 khung giờ"),
  tutorGenderPref: z.enum(["male", "female", "other", "any"]),
  tutorLevelPref: z.enum(["student", "teacher", "any"]),
  promoCode: z.string().max(50, "Mã ưu đãi tối đa 50 ký tự").optional().or(z.literal("")),
});

export const defaultClassRequestValues = {
  contactPhone: "",
  summary: "",
  description: "",
  subject: "",
  studentGender: "male",
  studentCount: 1,
  startDate: "",
  minutesPerSession: 90,
  sessionsPerWeek: 3,
  provinceCode: 0,
  districtCode: 0,
  locationLabel: "",
  availabilitySlots: [],
  tutorGenderPref: "any",
  tutorLevelPref: "any",
  promoCode: "",
};

/** Call when initializing the form — startDate defaults to today's local date. */
export const getDefaultClassRequestValues = () => ({
  ...defaultClassRequestValues,
  startDate: getTodayIsoDateLocal(),
});
