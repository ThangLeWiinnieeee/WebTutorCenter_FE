// Định dạng riêng cho biểu đồ thống kê admin (nhãn trục, rút gọn tiền tệ).
// Định dạng dùng chung toàn FE nằm ở @/lib/format.
import { formatNumber } from "@/lib/format";

export { formatNumber };

// Định dạng số tiền đầy đủ theo chuẩn Việt Nam.
export const formatVnd = (value) => `${formatNumber(value)}₫`;

// Rút gọn cho trục Y tiền tệ: 1.500.000 → "1,5Tr", 720.000 → "720K".
export const formatVndCompact = (value) => {
  const n = Number(value || 0);
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}Tr`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
};

// "2026-07-15" → "15/07"
export const formatDayTick = (key = "") => {
  const [, m, d] = key.split("-");
  return d && m ? `${d}/${m}` : key;
};

// "2026-07-15" → "15/07/2026"
export const formatDayFull = (key = "") => {
  const [y, m, d] = key.split("-");
  return d ? `${d}/${m}/${y}` : key;
};

// "2026-07" → "T7/2026"
export const formatMonthTick = (key = "") => {
  const [y, m] = key.split("-");
  return m ? `T${Number(m)}/${y}` : key;
};
