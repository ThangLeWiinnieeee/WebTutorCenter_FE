import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
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
