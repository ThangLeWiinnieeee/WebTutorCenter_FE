export const SUBJECTS = [
  "Toán", "Ngữ văn", "Tiếng Anh", "Vật lý", "Hóa học", "Sinh học",
  "Lịch sử", "Địa lý", "Giáo dục công dân", "Tin học", "Tiếng Pháp",
  "Tiếng Trung", "Tiếng Nhật", "Tiếng Hàn", "Tiếng Đức", "Âm nhạc",
  "Mỹ thuật", "Thể dục", "Toán cao cấp", "Vật lý đại cương",
  "Hóa học đại cương", "Lập trình", "Kế toán", "Kinh tế",
];


export const OCCUPATION_STATUS_OPTIONS = [
  { value: "student", label: "Sinh viên" },
  { value: "graduated", label: "Đã tốt nghiệp" },
  { value: "teacher", label: "Giáo viên" },
];

export const DAYS_OF_WEEK_OPTIONS = [
  { value: "Mon", label: "Thứ 2" },
  { value: "Tue", label: "Thứ 3" },
  { value: "Wed", label: "Thứ 4" },
  { value: "Thu", label: "Thứ 5" },
  { value: "Fri", label: "Thứ 6" },
  { value: "Sat", label: "Thứ 7" },
  { value: "Sun", label: "Chủ nhật" },
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
