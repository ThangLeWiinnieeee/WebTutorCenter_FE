// Helper định dạng dùng riêng cho khu vực duyệt nhận lớp.
// (formatDate ở đây kèm cả giờ, khác formatDate của classFormatters — giữ nguyên hành vi.)

export const formatPrice = (value) =>
  value != null
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
    : "—";

export const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const genderLabel = (value) =>
  value === "male" ? "Nam" : value === "female" ? "Nữ" : "Khác";

export const occupationLabel = (value) =>
  value === "student" ? "Sinh viên" : value === "teacher" ? "Giáo viên" : "Đã tốt nghiệp";
