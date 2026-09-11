// Options/filter/nhãn (dữ liệu thuần) cho AdminUsersPage.

export const USER_ROLE_OPTIONS = [
  { value: "", label: "Tất cả vai trò" },
  { value: "user", label: "Học viên" },
  { value: "tutor", label: "Gia sư" },
  { value: "admin", label: "Quản trị viên" },
];

export const USER_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "true", label: "Đang hoạt động" },
  { value: "false", label: "Đã khóa" },
];

export const USER_VERIFY_OPTIONS = [
  { value: "", label: "Tất cả xác thực" },
  { value: "true", label: "Đã xác thực" },
  { value: "false", label: "Chưa xác thực" },
];

export const USER_ROLE_CONFIG = {
  user: { label: "Học viên", className: "bg-blue-50 text-blue-700 border-blue-200" },
  tutor: { label: "Gia sư", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  admin: { label: "Quản trị viên", className: "bg-rose-50 text-rose-700 border-rose-200" },
};

export const USER_DEFAULT_FILTERS = {
  role: "",
  isActive: "",
  isVerified: "",
};
