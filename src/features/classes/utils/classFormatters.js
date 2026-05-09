export const formatPrice = (value) => `${(value || 0).toLocaleString("vi-VN")}đ`;

export const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("vi-VN");
};

export const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value)
    .toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(",", "");
};

const DAY_SORT_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DAY_SHORT_LABEL_VI = {
  Mon: "T2",
  Tue: "T3",
  Wed: "T4",
  Thu: "T5",
  Fri: "T6",
  Sat: "T7",
  Sun: "CN",
};

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

const fmtHourRange = (start, endExclusive) =>
  `${String(start).padStart(2, "0")}h–${String(endExclusive).padStart(2, "0")}h`;

/** @param {{ day: string; hour: number|string }[]} slots */
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
    next.set(day, [...new Set(hours)].sort((a, b) => a - b));
  }
  return next;
};

/** Một ô = 1 giờ (bắt đầu giờ `hour`). */
export function formatAvailabilitySlotsDetailed(slots) {
  const byDay = groupSlotsByDay(slots);
  if (byDay.size === 0) return "—";
  const lines = [];
  for (const day of DAY_SORT_ORDER) {
    const hours = byDay.get(day);
    if (!hours?.length) continue;
    const ranges = rangesFromSortedHours(hours);
    const label = DAY_SHORT_LABEL_VI[day] ?? day;
    const part = ranges.map(([s, e]) => fmtHourRange(s, e)).join(", ");
    lines.push(`${label}: ${part}`);
  }
  return lines.join("\n");
}

export function formatAvailabilitySlotsOneLine(slots) {
  const detailed = formatAvailabilitySlotsDetailed(slots);
  return detailed.replace(/\n/g, " · ");
}

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

export function formatClassTutorPrefsSummary(classItem) {
  if (!classItem) return "—";
  const lp = classItem.tutorLevelPref;
  const gp = classItem.tutorGenderPref;
  if (lp === "any" && gp === "any") return "Không yêu cầu trình độ và giới tính";
  return `${formatTutorLevelPref(lp)} · ${formatTutorGenderPref(gp)}`;
}
