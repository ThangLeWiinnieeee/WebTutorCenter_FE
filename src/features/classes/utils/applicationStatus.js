import { Ban, CheckCircle2, Clock, RotateCcw, XCircle } from "lucide-react";

/**
 * Metadata hiển thị cho trạng thái đơn nhận lớp của gia sư.
 * Khớp với enum CLASS_APPLICATION_STATUS bên backend: pending | approved | rejected.
 */
export const STATUS_META = {
  pending: {
    label: "Đang chờ duyệt",
    icon: Clock,
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dotClassName: "bg-amber-500",
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

export const STATUS_TABS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã chấp nhận" },
  { value: "rejected", label: "Bị từ chối" },
  { value: "cancel_requested", label: "Chờ duyệt hủy" },
  { value: "cancelled", label: "Đã hủy" },
];
