import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Chèn transform Cloudinary để lấy thumbnail vuông đúng kích cỡ hiển thị (crop fill),
// tránh tải ảnh gốc 500px cho ô avatar vài chục px. No-op với URL không phải Cloudinary
// (vd avatar Google) hoặc URL rỗng.
export function cldThumb(url, size = 128) {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/w_${size},h_${size},c_fill,g_face/`);
}

// Chuẩn hóa chuỗi để tìm kiếm: bỏ dấu tiếng Việt + về chữ thường.
// "Toán" / "toan" / "TOAN" đều thành "toan"; "Hà Nội" → "ha noi".
export function normalizeForSearch(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}
