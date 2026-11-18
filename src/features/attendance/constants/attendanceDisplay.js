export const ATTENDANCE_STATUS_META = {
  WAITING_CHECKIN_CONFIRMATION: {
    label: "Chờ học viên xác nhận vào lớp",
    shortLabel: "Chờ XN Check-in",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-800",
  },
  IN_PROGRESS: {
    label: "Đang diễn ra buổi học",
    shortLabel: "Đang học",
    badgeClass: "border-sky-200 bg-sky-50 text-sky-800",
  },
  WAITING_CHECKOUT_CONFIRMATION: {
    label: "Chờ học viên xác nhận kết thúc",
    shortLabel: "Chờ XN Check-out",
    badgeClass: "border-indigo-200 bg-indigo-50 text-indigo-800",
  },
  VALID: {
    label: "Hợp lệ (Tính buổi)",
    shortLabel: "Hợp lệ",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  CHECKIN_EXPIRED: {
    label: "Quá hạn xác nhận Check-in (30p)",
    shortLabel: "Quá hạn Check-in",
    badgeClass: "border-orange-200 bg-orange-50 text-orange-800",
  },
  CHECKOUT_EXPIRED: {
    label: "Quá hạn xác nhận Check-out (30p)",
    shortLabel: "Quá hạn Check-out",
    badgeClass: "border-orange-200 bg-orange-50 text-orange-800",
  },
  INSUFFICIENT_DURATION: {
    label: "Chưa đủ thời lượng buổi học",
    shortLabel: "Thiếu thời lượng",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-800",
  },
  REJECTED: {
    label: "Học viên từ chối xác nhận",
    shortLabel: "Bị từ chối",
    badgeClass: "border-rose-200 bg-rose-50 text-rose-800",
  },
  NEEDS_REVIEW: {
    label: "Quá thời gian mở buổi — Cần Admin rà soát",
    shortLabel: "Cần rà soát",
    badgeClass: "border-red-200 bg-red-50 text-red-800",
  },
  INVALIDATED: {
    label: "Không hợp lệ (Không tính buổi)",
    shortLabel: "Không hợp lệ",
    badgeClass: "border-slate-300 bg-slate-100 text-slate-700",
  },
};

export const ADMIN_OVERRIDE_ACTION_LABELS = {
  VALIDATE_SESSION: "Xác nhận hợp lệ thay học viên (Tính 1 buổi)",
  CONFIRM_CHECKIN_ON_BEHALF: "Xác nhận Check-in thay học viên (Vào lớp)",
  CONFIRM_CHECKOUT_ON_BEHALF: "Xác nhận Check-out thay học viên",
};

export const ALLOWED_ATTENDANCE_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_ATTENDANCE_PHOTO_BYTES = 10 * 1024 * 1024; // 10MB

export const validateAttendancePhotoFile = (file) => {
  if (!file) return "Vui lòng chọn ảnh chụp điểm danh";
  if (!ALLOWED_ATTENDANCE_PHOTO_TYPES.includes(file.type)) {
    return "Chỉ hỗ trợ định dạng ảnh JPG, PNG hoặc WEBP";
  }
  if (file.size > MAX_ATTENDANCE_PHOTO_BYTES) {
    return "Dung lượng ảnh tối đa 10MB";
  }
  return null;
};

export const formatDateVN = (value, { withTime = true } = {}) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      : {}),
  }).format(date);
};

export const formatRemainingWindow = (expireAt, nowMs) => {
  if (!expireAt) return null;
  const diffMs = new Date(expireAt).getTime() - nowMs;
  if (diffMs <= 0) return "Đã hết hạn 30 phút";
  const totalSec = Math.floor(diffMs / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};
