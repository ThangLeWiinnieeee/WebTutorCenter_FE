import {
  BookOpenText,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Lock,
  MapPin,
  PhoneCall,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  formatAvailabilitySlotsDetailed,
  formatClassTutorPrefsSummary,
  formatDate,
  formatDateTime,
  formatPrice,
  formatStudentGender,
} from "@/features/classes/utils/classFormatters";
import { STATUS_META } from "@/features/classes/utils/applicationStatus";

const MyClassDetailDialog = ({ open, application, onClose }) => {
  if (!open || !application) return null;

  const classItem = application.classItem || {};
  const isUnlocked = application.isUnlocked || application.status === "approved";
  const status = STATUS_META[application.status] || STATUS_META.pending;
  const StatusIcon = status.icon;

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-slate-950/50 px-4 py-8 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="my-class-detail-title"
        className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                Mã lớp {classItem.classCode}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
              </span>
            </div>
            <h2 id="my-class-detail-title" className="mt-2 text-xl font-bold leading-tight text-slate-900">
              {classItem.subject} - {classItem.summary || `Cần Gia Sư tại ${classItem.districtName || ''}, ${classItem.provinceName || ''}`}
            </h2>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
              <Clock3 className="h-3.5 w-3.5" />
              <span>Gửi yêu cầu lúc {formatDateTime(application.createdAt)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Rejection reason */}
          {application.status === "rejected" && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                <XCircle className="h-4 w-4" />
                Lý do từ chối
              </p>
              <p className="mt-1 text-sm text-rose-700/90">
                {application.rejectionReason || "Admin chưa cung cấp lý do cụ thể."}
              </p>
            </div>
          )}

          {/* Approved notice */}
          {isUnlocked && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Yêu cầu đã được chấp nhận
              </p>
              <p className="mt-1 text-sm text-emerald-700/90">
                Bạn đã có thể xem toàn bộ thông tin chi tiết của lớp và liên hệ phụ huynh.
              </p>
            </div>
          )}

          {/* Fee */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-700">Học phí / buổi</p>
                <p className="mt-0.5 text-2xl font-bold leading-none text-emerald-700">
                  {formatPrice(classItem.feePerSession)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-emerald-700">Ước tính / tháng</p>
                <p className="mt-0.5 text-lg font-semibold text-emerald-700">
                  {formatPrice(classItem.feePerMonth)}
                </p>
              </div>
            </div>
          </div>

          {/* Public info grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-100 bg-white px-3 py-3">
              <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Users className="h-4 w-4 text-emerald-600" />
                Học viên
              </p>
              <p className="text-sm text-slate-700">
                {classItem.studentCount} học viên
                {classItem.studentGender ? ` (${formatStudentGender(classItem.studentGender)})` : ""}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-white px-3 py-3">
              <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <CalendarDays className="h-4 w-4 text-emerald-600" />
                Tần suất học
              </p>
              <p className="text-sm text-slate-700">
                {classItem.sessionsPerWeek} buổi/tuần ({classItem.minutesPerSession} phút/buổi)
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-white px-3 py-3">
              <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <BookOpenText className="h-4 w-4 text-emerald-600" />
                Môn học
              </p>
              <p className="text-sm text-slate-700">{classItem.subject || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm text-slate-600 sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
              <p>Địa điểm: {classItem.locationLabel || "-"}</p>
            </div>
            <div className="flex items-start gap-2">
              <CalendarClock className="mt-0.5 h-4 w-4 text-slate-400" />
              <p>Ngày bắt đầu: {formatDate(classItem.startDate)}</p>
            </div>
            <div className="flex items-start gap-2">
              <UserRound className="mt-0.5 h-4 w-4 text-slate-400" />
              <p>Yêu cầu gia sư: {formatClassTutorPrefsSummary(classItem)}</p>
            </div>
          </div>

          {/* Private / detailed info */}
          {isUnlocked ? (
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  Mô tả chi tiết
                </p>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm leading-relaxed text-slate-700">
                    {classItem.description || "Chưa có mô tả chi tiết cho lớp học này."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700">
                <PhoneCall className="mt-0.5 h-4 w-4 text-emerald-600" />
                <p>
                  SĐT liên hệ phụ huynh:{" "}
                  <span className="font-semibold text-slate-900">{classItem.contactPhone || "-"}</span>
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white px-4 py-4">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Clock3 className="h-4 w-4 text-emerald-600" />
                  Thời gian có thể học (theo khung đã chọn)
                </p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                  {formatAvailabilitySlotsDetailed(classItem.availabilitySlots)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-slate-500">
                <Lock className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Thông tin chi tiết đang được ẩn</p>
              <p className="max-w-md text-sm text-slate-500">
                Mô tả đầy đủ, số điện thoại liên hệ và khung giờ cụ thể của lớp chỉ hiển thị sau khi
                yêu cầu nhận lớp của bạn được admin{" "}
                <span className="font-medium text-emerald-700">chấp nhận</span>.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 w-full rounded-lg border-slate-300 text-slate-700 sm:w-auto"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MyClassDetailDialog;
