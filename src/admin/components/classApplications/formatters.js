// Định dạng riêng cho khu vực duyệt nhận lớp.
// Ngày/giờ và nhãn giới tính/nghề nghiệp lấy từ nguồn chung (@/lib/format, @/constants/enums,
// @/features/tutors/constants) — trước đây file này viết lại cả ba.

// Định dạng số tiền kiểu Intl currency ("1.200.000 ₫") — chỉ khu vực này dùng.
export const formatPrice = (value) =>
  value != null ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value) : "—";
