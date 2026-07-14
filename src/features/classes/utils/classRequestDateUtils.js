import {
  getMinStartIsoDateLocal,
  getTodayIsoDateLocal,
  MIN_START_LEAD_DAYS,
} from '@/features/classes/schemas/classRequestSchema';

export const formatDdMmYyyyUi = (iso) => {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
};

export const toLocalIsoDate = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

export const parseIsoToLocalMidnightDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// Ngày kế ngay sau ngày bắt đầu sớm nhất được phép (hôm nay + 3 ngày) — nút chọn nhanh
export const dayAfterMinStartIsoFromTodayLocal = () => {
  const base = parseIsoToLocalMidnightDate(getTodayIsoDateLocal());
  base.setDate(base.getDate() + MIN_START_LEAD_DAYS + 1);
  return toLocalIsoDate(base);
};

// Thứ Bảy đầu tiên vào/sau ngày bắt đầu sớm nhất được phép (>= hôm nay + 2 ngày)
export const saturdayIsoOnOrAfterMinLocal = () => {
  const base = parseIsoToLocalMidnightDate(getMinStartIsoDateLocal());
  const wd = base.getDay();
  const daysUntilSaturday = wd === 6 ? 0 : (6 - wd + 7) % 7;
  base.setDate(base.getDate() + daysUntilSaturday);
  return toLocalIsoDate(base);
};

// Map dữ liệu bài đăng (DTO) sang giá trị form khi chỉnh sửa
export const mapClassToFormValues = (cls) => ({
  contactPhone: cls.contactPhone || "",
  summary: cls.summary || "",
  description: cls.description || "",
  subject: cls.subject || "",
  studentGender: cls.studentGender || "male",
  studentCount: cls.studentCount || 1,
  startDate: cls.startDate ? toLocalIsoDate(new Date(cls.startDate)) : getMinStartIsoDateLocal(),
  minutesPerSession: cls.minutesPerSession,
  sessionsPerWeek: cls.sessionsPerWeek,
  provinceCode: cls.provinceCode || 0,
  districtCode: cls.districtCode || 0,
  locationLabel: cls.locationLabel || "",
  availabilitySlots: Array.isArray(cls.availabilitySlots)
    ? cls.availabilitySlots.map((s) => ({ day: s.day, hour: s.hour }))
    : [],
  tutorGenderPref: cls.tutorGenderPref || "any",
  tutorLevelPref: cls.tutorLevelPref || "any",
  promoCode: "", // không sửa mã ưu đãi qua chức năng chỉnh sửa
});
