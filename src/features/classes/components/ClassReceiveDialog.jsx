import { AlertTriangle, CheckCircle2, Loader2, LogIn, Send, X } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  formatAvailabilitySlotsOneLine,
  formatClassTutorPrefsSummary,
} from "@/features/classes/utils/classFormatters";

const DIALOG_CONFIG = {
  login: {
    icon: LogIn,
    iconClassName: "bg-blue-50 text-blue-700 border-blue-100",
    title: "Cần đăng nhập để nhận lớp",
    description: "Bạn cần đăng nhập vào tài khoản trước khi nhận lớp cần gia sư này.",
    primaryLabel: "Đăng nhập",
    primaryTo: "/login",
  },
  tutorRequired: {
    icon: AlertTriangle,
    iconClassName: "bg-amber-50 text-amber-700 border-amber-100",
    title: "Cần đăng ký làm gia sư",
    description: "Tài khoản của bạn chưa có vai trò gia sư. Vui lòng đăng ký và chờ duyệt hồ sơ trước khi nhận lớp.",
    primaryLabel: "Đăng ký làm gia sư",
    primaryTo: "/register-tutor",
  },
  confirm: {
    icon: Send,
    iconClassName: "bg-emerald-50 text-emerald-700 border-emerald-100",
    title: "Xác nhận gửi yêu cầu nhận lớp",
    description: "Admin sẽ xem xét và duyệt yêu cầu của bạn. Bạn sẽ nhận được thông báo khi có kết quả.",
  },
  mismatch: {
    icon: AlertTriangle,
    iconClassName: "bg-rose-50 text-rose-700 border-rose-100",
    title: "Bạn chưa đủ điều kiện nhận lớp này, hẹn bạn lớp sau",
    description: "Môn học của lớp này không nằm trong danh sách các môn bạn đăng ký dạy. Vui lòng cập nhật hồ sơ hoặc tìm các lớp học phù hợp hơn.",
  },
  submitted: {
    icon: CheckCircle2,
    iconClassName: "bg-emerald-50 text-emerald-700 border-emerald-100",
    title: "Đã gửi yêu cầu thành công",
    description: "Yêu cầu nhận lớp của bạn đã được gửi. Vui lòng chờ admin xét duyệt — bạn sẽ nhận thông báo khi có kết quả.",
  },
};

const ClassReceiveDialog = ({
  open,
  type,
  classItem,
  returnTo,
  onClose,
  onConfirm,
  applying,
  tutorSubjects = [],
  mismatchReasons = [],
}) => {
  if (!open) return null;

  const config = DIALOG_CONFIG[type] || DIALOG_CONFIG.login;
  const Icon = config.icon;
  const primaryState = type === "login" ? { from: returnTo } : undefined;

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="class-receive-dialog-title"
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150"
      >
        <div className="flex items-start justify-between gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${config.iconClassName}`}>
            <Icon className="h-6 w-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
            aria-label="Đóng thông báo"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-2">
          <h2 id="class-receive-dialog-title" className="text-lg font-bold text-slate-900 leading-snug">
            {config.title}
          </h2>
          <p className="text-sm leading-relaxed text-slate-500">{config.description}</p>
        </div>

        {classItem && (
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3.5 text-sm text-slate-600 space-y-2">
            <p className="font-bold text-slate-800 flex items-center justify-between">
              <span>Mã lớp: #{classItem.classCode || ""}</span>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded border border-emerald-100">
                {classItem.subject}
              </span>
            </p>
            {classItem.availabilitySlots && (
              <p>
                <span className="font-medium text-slate-400">Lịch học:</span>{" "}
                <span className="text-slate-700 font-medium">{formatAvailabilitySlotsOneLine(classItem.availabilitySlots)}</span>
              </p>
            )}
            <p>
              <span className="font-medium text-slate-400">Yêu cầu gia sư:</span>{" "}
              <span className="text-slate-700 font-medium">{formatClassTutorPrefsSummary(classItem)}</span>
            </p>
            <p>
              <span className="font-medium text-slate-400">Địa điểm:</span>{" "}
              <span className="text-slate-700 font-medium">{classItem.provinceName && classItem.districtName ? `${classItem.provinceName}, ${classItem.districtName}` : classItem.locationLabel}</span>
            </p>
          </div>
        )}

        {type === "mismatch" && mismatchReasons && mismatchReasons.length > 0 && (
          <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50/50 p-3.5 text-xs text-rose-700 space-y-1.5 shadow-inner">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              Chi tiết điều kiện chưa đạt:
            </p>
            <ul className="list-inside list-disc pl-1 space-y-1">
              {mismatchReasons.map((reason, idx) => (
                <li key={idx} className="leading-relaxed">{reason}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end border-t border-slate-100 pt-4">
          {type !== "submitted" && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={applying}
              className="h-10 rounded-lg border-slate-300 text-slate-700"
            >
              Để sau
            </Button>
          )}

          {type === "confirm" && (
            <Button
              type="button"
              disabled={applying}
              onClick={onConfirm}
              className="h-10 rounded-lg bg-emerald-600 px-5 font-semibold text-white hover:bg-emerald-700"
            >
              {applying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi yêu cầu nhận lớp"
              )}
            </Button>
          )}

          {type === "mismatch" && (
            <Button
              asChild
              className="h-10 rounded-lg bg-emerald-600 px-5 font-semibold text-white hover:bg-emerald-700"
            >
              <Link
                to={`/classes?subject=${encodeURIComponent(
                  tutorSubjects && tutorSubjects.length > 0 ? tutorSubjects[0] : ""
                )}`}
                onClick={onClose}
              >
                Tìm lớp phù hợp
              </Link>
            </Button>
          )}

          {type === "submitted" && (
            <Button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg bg-emerald-600 px-5 font-semibold text-white hover:bg-emerald-700"
            >
              Đóng
            </Button>
          )}

          {(type === "login" || type === "tutorRequired") && (
            <Button
              asChild
              className="h-10 rounded-lg bg-[#1e3a5f] px-5 font-semibold text-white hover:bg-[#16304f]"
            >
              <Link to={config.primaryTo} state={primaryState}>
                {config.primaryLabel}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassReceiveDialog;
