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

// Suy ra bảng nhãn từ OPTIONS để không lặp dữ liệu (một nguồn sự thật).
export const OCCUPATION_STATUS_LABEL = Object.fromEntries(
  OCCUPATION_STATUS_OPTIONS.map((o) => [o.value, o.label]),
);

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

// Ràng buộc upload ảnh giấy tờ gia sư — dùng chung cho DocumentUploadField & DocumentMultiUpload.
export const TUTOR_UPLOAD_MAX_SIZE = 8 * 1024 * 1024; // 8 MB
export const TUTOR_UPLOAD_ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
