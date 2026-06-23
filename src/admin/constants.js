// Cấu hình dạng dữ liệu (options/filter/nhãn) cho các trang khu vực admin.
// Tách khỏi JSX để dễ tái sử dụng và chỉnh sửa tập trung.
// Lưu ý: cấu hình gắn với icon/màu sắc (TABS có icon, STATUS_META…) vẫn để cạnh
// component vì là "view config", không phải dữ liệu thuần.

export const ADMIN_PAGE_SIZE = 10;

// --- AdminUsersPage ---
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
  keyword: "",
  role: "",
  isActive: "",
  isVerified: "",
};

// --- AdminPromosPage ---
export const PROMO_TYPE_OPTIONS = [
  { value: "", label: "Tất cả loại giảm" },
  { value: "percent", label: "Giảm theo %" },
  { value: "fixed", label: "Giảm số tiền" },
];

export const PROMO_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "true", label: "Đang bật" },
  { value: "false", label: "Đã tắt" },
];

export const PROMO_DEFAULT_FILTERS = { keyword: "", discountType: "", isActive: "" };

// --- AdminTrashPage ---
export const TRASH_ROLE_LABEL = { admin: "Quản trị", tutor: "Gia sư", user: "Người dùng" };

export const TRASH_PURGE_COPY = {
  users: "Tài khoản sẽ bị xóa vĩnh viễn khỏi hệ thống và không thể khôi phục.",
  classes: "Bài đăng cùng toàn bộ đơn nhận lớp liên quan sẽ bị xóa vĩnh viễn.",
  promos: "Mã ưu đãi sẽ bị xóa vĩnh viễn khỏi hệ thống.",
};

export const TRASH_SECONDARY_HEADER = { users: "Vai trò", classes: "Người đăng", promos: "Giảm giá" };
