// Nguồn sự thật duy nhất cho việc định dạng hiển thị (locale vi-VN).
// Trước đây formatDate được viết lại ở 9 file và getInitials ở 5 file, mỗi bản một
// kiểu fallback (và getInitials còn khác cả thuật toán) → gộp về đây.

const DMY = { day: "2-digit", month: "2-digit", year: "numeric" };

// Parse an toàn: trả null cho giá trị rỗng hoặc ngày không hợp lệ.
const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

// Ngày dd/mm/yyyy. `fallback` để mỗi màn giữ đúng ký tự trống cũ ("—", "-", "", null).
export const formatDate = (value, fallback = "—") =>
  toDate(value)?.toLocaleDateString("vi-VN", DMY) ?? fallback;

// Ngày giờ dd/mm/yyyy HH:mm.
export const formatDateTime = (value, fallback = "—") =>
  toDate(value)
    ?.toLocaleString("vi-VN", { ...DMY, hour: "2-digit", minute: "2-digit" })
    ?.replace(",", "") ?? fallback;

// Số nguyên theo chuẩn Việt Nam: 1.234.567
export const formatNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

// ponytail: cố tình KHÔNG gộp formatPrice ở đây — FE đang có 3 kiểu hiển thị giá khác
// nhau đã lên production ("1.200.000đ", "1.200.000 ₫" của Intl currency, bản rút gọn
// "1,2 tr"). Gộp lại là đổi giao diện, không phải dọn code. Thống nhất khi design chốt.

// Chữ cái đầu (họ + tên gọi) làm avatar thay thế. Tên Việt để tên gọi ở cuối nên
// lấy chữ đầu của từ đầu và từ cuối: "Lê Đăng Toàn Thắng" → "LT".
export const getInitials = (name, fallback = "?") => {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
