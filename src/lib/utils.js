import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Gộp danh sách class Tailwind, tự loại bỏ class trùng/xung đột.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Đổi URL ảnh Cloudinary sang bản thumbnail vuông theo kích cỡ hiển thị.
// No-op với URL rỗng hoặc không phải Cloudinary (vd avatar Google).
export function cldThumb(url, size = 128) {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/w_${size},h_${size},c_fill,g_face/`);
}

// Chuẩn hóa chuỗi để so khớp tìm kiếm: bỏ dấu tiếng Việt và về chữ thường.
export function normalizeForSearch(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}
