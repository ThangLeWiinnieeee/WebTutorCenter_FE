import { Ban, CheckCircle2, Clock, Hand, MailOpen, MinusCircle, RotateCcw, UserCheck, XCircle } from "lucide-react";

/**
 * Metadata hiển thị cho trạng thái đơn nhận lớp của gia sư.
 * Khớp với enum CLASS_APPLICATION_STATUS bên backend:
 * pending | selected | approved | rejected | not_selected | cancel_requested | cancelled.
 */
export const STATUS_META = {
  pending: {
    label: "Chờ người đăng chọn",
    icon: Clock,
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dotClassName: "bg-amber-500",
  },
  selected: {
    label: "Đã được chọn · chờ admin duyệt",
    icon: UserCheck,
    className: "border-sky-200 bg-sky-50 text-sky-700",
    dotClassName: "bg-sky-500",
  },
  approved: {
    label: "Đã được chấp nhận",
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClassName: "bg-emerald-500",
  },
  rejected: {
    label: "Đã bị từ chối",
    icon: XCircle,
    className: "border-rose-200 bg-rose-50 text-rose-700",
    dotClassName: "bg-rose-500",
  },
  not_selected: {
    label: "Không được chọn",
    icon: MinusCircle,
    className: "border-slate-200 bg-slate-100 text-slate-600",
    dotClassName: "bg-slate-400",
  },
  cancel_requested: {
    label: "Chờ duyệt hủy",
    icon: RotateCcw,
    className: "border-orange-200 bg-orange-50 text-orange-700",
    dotClassName: "bg-orange-500",
  },
  cancelled: {
    label: "Đã hủy",
    icon: Ban,
    className: "border-slate-200 bg-slate-100 text-slate-600",
    dotClassName: "bg-slate-400",
  },
};

/**
 * Metadata phân biệt NGUỒN GỐC đơn nhận lớp (khớp CLASS_APPLICATION_ORIGIN backend):
 * - apply : gia sư chủ động ấn nhận lớp từ bài đăng công khai
 * - invite: người đăng chủ động gửi lời mời dạy đích danh cho gia sư
 */
export const ORIGIN_META = {
  apply: {
    label: "Bạn nhận lớp",
    timeLabel: "Gửi yêu cầu lúc",
    icon: Hand,
    className: "border-teal-200 bg-teal-50 text-teal-700",
  },
  invite: {
    label: "Lời mời dạy",
    timeLabel: "Được mời lúc",
    icon: MailOpen,
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
};

export const STATUS_TABS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ chọn" },
  { value: "selected", label: "Đã được chọn" },
  { value: "approved", label: "Đã chấp nhận" },
  { value: "rejected", label: "Bị từ chối" },
  { value: "not_selected", label: "Không được chọn" },
  { value: "cancel_requested", label: "Chờ duyệt hủy" },
  { value: "cancelled", label: "Đã hủy" },
];

// Nhãn trạng thái theo GÓC NHÌN NGƯỜI ĐĂNG (xem danh sách gia sư ứng tuyển bài của mình).
// Ngắn gọn & khác ngữ cảnh với STATUS_META (góc nhìn gia sư) nên tách map riêng.
export const APPLICANT_STATUS_META = {
  pending: { label: "Chờ chọn", className: "bg-slate-100 text-slate-600 border-slate-200" },
  selected: { label: "Đã chọn · chờ admin duyệt", className: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Đã duyệt", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Admin đã từ chối", className: "bg-rose-50 text-rose-700 border-rose-200" },
};
