// Nhãn dùng chung lấy từ nguồn sự thật duy nhất (src/constants/enums.js)
export { GENDER_LABEL } from "@/constants/enums";
export { DAY_OPTIONS as DAYS_OF_WEEK_OPTIONS } from "@/constants/enums";

// Lưu ý: danh sách môn học giờ lấy từ DB qua hook useSubjects (admin quản lý),
// không còn fix cứng ở đây.

export const OCCUPATION_STATUS_OPTIONS = [
  { value: "student", label: "Sinh viên" },
  { value: "graduated", label: "Đã tốt nghiệp" },
  { value: "teacher", label: "Giáo viên" },
];

export const TUTOR_STATUS_CONFIG = {
  pending: {
    label: "Chờ xét duyệt",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  approved: {
    label: "Đã duyệt",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  rejected: {
    label: "Bị từ chối",
    className: "bg-rose-50 text-rose-700 border border-rose-200",
  },
};

export const OCCUPATION_STATUS_LABEL = {
  student: "Sinh viên",
  graduated: "Đã tốt nghiệp",
  teacher: "Giáo viên",
};

// Tính tuổi từ ngày sinh (ISO string hoặc Date)
export const getAgeFromDate = (value) => {
  if (!value) return null;
  const dob = new Date(value);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age >= 0 && age < 120 ? age : null;
};
