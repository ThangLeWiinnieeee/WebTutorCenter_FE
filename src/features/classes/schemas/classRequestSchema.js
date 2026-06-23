import { z } from 'zod';
import { DAYS_OF_WEEK } from "@/constants/enums";

const availabilitySlotSchema = z.object({
  day: z.enum(DAYS_OF_WEEK),
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

export const buildClassRequestSchema = (pricingConfig) => {
  const minutesOptions = [...(pricingConfig?.minutesPerSessionOptions || [60, 90, 120, 150, 180])].sort(
    (a, b) => a - b,
  );
  const minMinutes = minutesOptions[0] ?? 60;
  const maxMinutes = minutesOptions[minutesOptions.length - 1] ?? 180;
  const optionsLabel = minutesOptions.join(", ");

  const minutesPerSessionSchema = z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) return undefined;
      return Number(value);
    },
    z
      .number()
      .int()
      .min(minMinutes, `Thời lượng tối thiểu ${minMinutes} phút`)
      .max(maxMinutes, `Thời lượng tối đa ${maxMinutes} phút`)
      .refine((val) => minutesOptions.includes(val), {
        message: `Vui lòng chọn một mức: ${optionsLabel} phút`,
      }),
  );

  const sessionsMin = pricingConfig?.sessionsPerWeekMin ?? 1;
  const sessionsMax = pricingConfig?.sessionsPerWeekMax ?? 7;

  return z.object({
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
    sessionsPerWeek: z.preprocess(
      (value) => {
        if (value === "" || value === null || value === undefined) return undefined;
        return Number(value);
      },
      z
        .number()
        .int()
        .min(sessionsMin, `Số buổi học tối thiểu là ${sessionsMin}`)
        .max(sessionsMax, `Số buổi học tối đa là ${sessionsMax}`),
    ),
    provinceCode: numberFromInput(1, "Vui lòng chọn tỉnh/thành"),
    districtCode: numberFromInput(1, "Vui lòng chọn quận/huyện"),
    locationLabel: z.string().min(3, "Vui lòng nhập địa chỉ ngắn gọn").max(200, "Địa chỉ tối đa 200 ký tự"),
    availabilitySlots: z.array(availabilitySlotSchema).min(1, "Vui lòng chọn ít nhất 1 khung giờ"),
    tutorGenderPref: z.enum(["male", "female", "other", "any"]),
    tutorLevelPref: z.enum(["student", "teacher", "any"]),
    promoCode: z.string().max(50, "Mã ưu đãi tối đa 50 ký tự").optional().or(z.literal("")),
  });
};

export const getDefaultClassRequestValues = (pricingConfig) => {
  const defaultMinutes =
    pricingConfig?.defaultMinutesPerSession ??
    pricingConfig?.minutesPerSessionOptions?.[0] ??
    90;

  return {
    contactPhone: "",
    summary: "",
    description: "",
    subject: "",
    studentGender: "male",
    studentCount: 1,
    startDate: getTodayIsoDateLocal(),
    minutesPerSession: defaultMinutes,
    sessionsPerWeek: 3,
    provinceCode: 0,
    districtCode: 0,
    locationLabel: "",
    availabilitySlots: [],
    tutorGenderPref: "any",
    tutorLevelPref: "any",
    promoCode: "",
  };
};
