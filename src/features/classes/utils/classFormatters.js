import { DAYS_OF_WEEK, DAY_SHORT_LABEL_VI } from "@/constants/enums";
import { formatDate as formatDateBase, formatDateTime as formatDateTimeBase } from "@/lib/format";

// Định dạng số tiền theo chuẩn Việt Nam.
export const formatPrice = (value) => `${(value || 0).toLocaleString("vi-VN")}đ`;

// Tỉ lệ phí gia sư trả để nhận lớp, tính trên học phí tháng đầu.
const CLASS_FEE_RATE = 0.12;
export const CLASS_FEE_LABEL = `${Math.round(CLASS_FEE_RATE * 100)}% học phí tháng đầu`;

// Tính phí nhận lớp từ học phí sau giảm giá, làm tròn tới 1.000đ giống backend.
export const classFee = (classItem) => {
  const monthly = classItem?.finalFeePerMonth ?? classItem?.feePerMonth ?? 0;
  return Math.max(0, Math.round((monthly * CLASS_FEE_RATE) / 1000) * 1000);
};

// Ngày/giờ dùng bản chung, giữ dấu "-" làm ký tự trống như các màn lớp học vẫn hiển thị.
export const formatDate = (value) => formatDateBase(value, "-");
export const formatDateTime = (value) => formatDateTimeBase(value, "-");

// Gộp các giờ liên tiếp thành các khoảng [bắt đầu, kết thúc).
const rangesFromSortedHours = (sortedUnique) => {
  if (!sortedUnique.length) return [];
  const out = [];
  let start = sortedUnique[0];
  let endExclusive = sortedUnique[0] + 1;
  for (let i = 1; i < sortedUnique.length; i++) {
    const h = sortedUnique[i];
    if (h === endExclusive) {
      endExclusive = h + 1;
    } else {
      out.push([start, endExclusive]);
      start = h;
      endExclusive = h + 1;
    }
  }
  out.push([start, endExclusive]);
  return out;
};

// Định dạng một khoảng giờ thành chuỗi dạng "08h–10h".
const fmtHourRange = (start, endExclusive) =>
  `${String(start).padStart(2, "0")}h–${String(endExclusive).padStart(2, "0")}h`;

// Nhóm các ô lịch theo ngày và sắp xếp giờ tăng dần.
const groupSlotsByDay = (slots) => {
  const map = new Map();
  if (!Array.isArray(slots)) return map;
  for (const s of slots) {
    const day = s?.day;
    const h = Number(s?.hour);
    if (!day || Number.isNaN(h)) continue;
    if (!map.has(day)) map.set(day, []);
    map.get(day).push(h);
  }
  const next = new Map();
  for (const [day, hours] of map) {
    next.set(
      day,
      [...new Set(hours)].sort((a, b) => a - b),
    );
  }
  return next;
};

// Mô tả lịch rảnh theo nhiều dòng, mỗi ngày một dòng.
export function formatAvailabilitySlotsDetailed(slots) {
  const byDay = groupSlotsByDay(slots);
  if (byDay.size === 0) return "—";
  const lines = [];
  for (const day of DAYS_OF_WEEK) {
    const hours = byDay.get(day);
    if (!hours?.length) continue;
    const ranges = rangesFromSortedHours(hours);
    const label = DAY_SHORT_LABEL_VI[day] ?? day;
    const part = ranges.map(([s, e]) => fmtHourRange(s, e)).join(", ");
    lines.push(`${label}: ${part}`);
  }
  return lines.join("\n");
}

// Mô tả lịch rảnh gọn trên một dòng.
export function formatAvailabilitySlotsOneLine(slots) {
  const detailed = formatAvailabilitySlotsDetailed(slots);
  return detailed.replace(/\n/g, " · ");
}

// Đổi yêu cầu trình độ gia sư sang nhãn tiếng Việt.
export function formatTutorLevelPref(value) {
  switch (value) {
    case "student":
      return "Sinh viên";
    case "teacher":
      return "Giáo viên";
    case "any":
    default:
      return "Không yêu cầu trình độ";
  }
}

// Đổi yêu cầu giới tính gia sư sang nhãn tiếng Việt.
export function formatTutorGenderPref(value) {
  switch (value) {
    case "male":
      return "Nam";
    case "female":
      return "Nữ";
    case "other":
      return "Nam/Nữ";
    case "any":
    default:
      return "Không yêu cầu giới tính";
  }
}

// Đổi giới tính học viên sang nhãn tiếng Việt.
export function formatStudentGender(value) {
  switch (value) {
    case "male":
      return "Nam";
    case "female":
      return "Nữ";
    case "other":
      return "Hỗn hợp";
    default:
      return "";
  }
}

// Tóm tắt yêu cầu về gia sư của một lớp thành một dòng.
export function formatClassTutorPrefsSummary(classItem) {
  if (!classItem) return "—";
  const lp = classItem.tutorLevelPref;
  const gp = classItem.tutorGenderPref;
  if (lp === "any" && gp === "any") return "Không yêu cầu trình độ và giới tính";
  return `${formatTutorLevelPref(lp)} · ${formatTutorGenderPref(gp)}`;
}
